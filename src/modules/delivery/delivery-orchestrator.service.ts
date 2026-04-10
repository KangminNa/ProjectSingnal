import { Injectable, Inject, Logger } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, PRESENCE_STORE, JOB_QUEUE, DELIVERY_LOG_REPOSITORY } from '@core/injection-tokens';
import type { SubscriptionRepository, DeliveryLogRepository, ConsumerTarget } from '@core/repository';
import type { PresenceStore, JobQueue, EventEnvelope } from '@core/event-bus';
import type { TransportResponse } from '@core/transport';
import { toDeliveryChannel, toProtocol } from '@common/utils/channel-mapper';
import { TransportRegistry } from './transport.registry';

const MAX_CONCURRENT_DELIVERIES = 20;
const DELIVERY_TIMEOUT_MS = 10_000;

/**
 * DeliveryOrchestratorService -- conductor of the delivery pipeline
 *
 * 1. Look up subscription targets matching the event
 * 2. Map ConsumerType -> TransportProtocol (label -> actual protocol)
 * 3. Resolve adapter from TransportRegistry and send
 * 4. Log the result into DeliveryLog
 */
@Injectable()
export class DeliveryOrchestratorService {
  private readonly logger = new Logger(DeliveryOrchestratorService.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepository,
    @Inject(DELIVERY_LOG_REPOSITORY) private readonly deliveryLogRepo: DeliveryLogRepository,
    @Inject(PRESENCE_STORE) private readonly presenceStore: PresenceStore,
    @Inject(JOB_QUEUE) private readonly jobQueue: JobQueue,
    private readonly transportRegistry: TransportRegistry,
  ) {}

  async deliver(event: EventEnvelope): Promise<void> {
    const targets = await this.subscriptionRepo.findTargets(event.projectId, event.eventType);
    if (targets.length === 0) return;
    this.logger.log(`Delivering event ${event.eventId} to ${targets.length} target(s)`);

    const batches = this.chunk(targets, MAX_CONCURRENT_DELIVERIES);

    for (const batch of batches) {
      const results = await Promise.allSettled(
        batch.map(target => this.deliverToTarget(event, target)),
      );

      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'rejected') {
          this.logger.error(`Delivery failed for consumer ${batch[i].consumerId}: ${(results[i] as PromiseRejectedResult).reason}`);
        }
      }
    }
  }

  private async deliverToTarget(event: EventEnvelope, target: ConsumerTarget): Promise<void> {
    const protocol = toProtocol(target.consumerType as any);
    const channel = toDeliveryChannel(target.consumerType as any);
    const adapter = this.transportRegistry.resolve(protocol);

    if (!adapter) {
      this.logger.warn(`No adapter for protocol: ${protocol}`);
      return;
    }

    // WebSocket: only send when online, otherwise enqueue push fallback
    if (target.consumerType === 'WEBSOCKET') {
      const isOnline = await this.presenceStore.isOnline(event.projectId, target.consumerId);
      if (!isOnline) {
        await this.jobQueue.enqueue('push-fallback', { event, target }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        });
        return;
      }
    }

    let result: TransportResponse;
    try {
      result = await this.withTimeout(
        adapter.send({
          eventId: event.eventId,
          projectId: event.projectId,
          consumerId: target.consumerId,
          payload: event.payload,
          endpoint: target.endpoint,
        }),
        DELIVERY_TIMEOUT_MS,
      );
    } catch (error) {
      result = {
        success: false,
        protocol,
        error: error instanceof Error ? error.message : 'Delivery timeout',
        retryable: true,
      };
    }

    // Record delivery result
    await this.deliveryLogRepo.create({
      projectId: event.projectId,
      eventId: event.eventId,
      consumerId: target.consumerId,
      channelType: channel,
      status: result.success ? 'delivered' : 'failed',
      lastError: result.error,
    });

    // Enqueue retry on failure
    if (!result.success && result.retryable) {
      await this.jobQueue.enqueue('webhook-retry', { event, target }, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
      });
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Delivery timed out after ${ms}ms`)), ms),
      ),
    ]);
  }

  private chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }
}
