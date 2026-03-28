import { Injectable, Inject, Logger } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, PRESENCE_STORE, JOB_QUEUE, DELIVERY_LOG_REPOSITORY } from '@common/constants/injection-tokens';
import { SubscriptionRepository } from '@domain/ports/outbound/repositories/subscription.repository.port';
import { DeliveryLogRepository } from '@domain/ports/outbound/repositories/delivery-log.repository.port';
import { PresenceStore } from '@domain/ports/outbound/presence-store.port';
import { JobQueue } from '@domain/ports/outbound/job-queue.port';
import { EventEnvelope } from '@common/types/event-envelope';
import { ConsumerType, ConsumerTarget } from '@common/types/consumer.types';
import { DeliveryResult } from '@common/types/delivery.types';
import { toDeliveryChannel } from '@common/utils/channel-mapper';
import { DeliveryAdapterFactory } from '../factories/delivery-adapter.factory';

const MAX_CONCURRENT_DELIVERIES = 20;
const DELIVERY_TIMEOUT_MS = 10_000;

@Injectable()
export class DeliveryOrchestratorService {
  private readonly logger = new Logger(DeliveryOrchestratorService.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepository,
    @Inject(DELIVERY_LOG_REPOSITORY) private readonly deliveryLogRepo: DeliveryLogRepository,
    @Inject(PRESENCE_STORE) private readonly presenceStore: PresenceStore,
    @Inject(JOB_QUEUE) private readonly jobQueue: JobQueue,
    private readonly adapterFactory: DeliveryAdapterFactory,
  ) {}

  async deliver(event: EventEnvelope): Promise<void> {
    const targets = await this.subscriptionRepo.findTargets(event.projectId, event.eventType);
    if (targets.length === 0) return;

    const batches = this.chunk(targets, MAX_CONCURRENT_DELIVERIES);

    for (const batch of batches) {
      const results = await Promise.allSettled(
        batch.map(target => this.deliverToTarget(event, target)),
      );

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'rejected') {
          this.logger.error(
            `Unexpected delivery failure for consumer ${batch[i].consumerId}: ${result.reason}`,
          );
        }
      }
    }
  }

  private async deliverToTarget(event: EventEnvelope, target: ConsumerTarget): Promise<void> {
    const channel = toDeliveryChannel(target.consumerType);
    const adapter = this.adapterFactory.getAdapter(target.consumerType);

    if (!adapter) {
      this.logger.warn(`No adapter registered for consumer type: ${target.consumerType}`);
      return;
    }

    if (target.consumerType === ConsumerType.WEBSOCKET) {
      const isOnline = await this.presenceStore.isOnline(event.projectId, target.consumerId);
      if (!isOnline) {
        await this.jobQueue.enqueue('push-fallback', { event, target }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        });
        return;
      }
    }

    let result: DeliveryResult;
    try {
      result = await this.withTimeout(
        adapter.deliver({
          eventId: event.eventId,
          projectId: event.projectId,
          consumerId: target.consumerId,
          channel,
          payload: event.payload,
          endpoint: target.endpoint,
        }),
        DELIVERY_TIMEOUT_MS,
      );
    } catch (error) {
      result = {
        success: false,
        channel,
        error: error instanceof Error ? error.message : 'Delivery timeout',
        retryable: true,
      };
    }

    await this.deliveryLogRepo.create({
      projectId: event.projectId,
      eventId: event.eventId,
      consumerId: target.consumerId,
      channelType: result.channel,
      status: result.success ? 'delivered' : 'failed',
      lastError: result.error,
    });

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
