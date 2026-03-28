import { Injectable, Inject, Logger } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, PRESENCE_STORE, JOB_QUEUE, DELIVERY_LOG_REPOSITORY } from '@common/constants/injection-tokens';
import { SubscriptionRepository } from '@domain/ports/outbound/repositories/subscription.repository.port';
import { DeliveryLogRepository } from '@domain/ports/outbound/repositories/delivery-log.repository.port';
import { PresenceStore } from '@domain/ports/outbound/presence-store.port';
import { JobQueue } from '@domain/ports/outbound/job-queue.port';
import { EventEnvelope } from '@common/types/event-envelope';
import { ConsumerType } from '@common/types/consumer.types';
import { DeliveryAdapterFactory } from '../factories/delivery-adapter.factory';

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

    for (const target of targets) {
      const adapter = this.adapterFactory.getAdapter(target.consumerType);
      if (!adapter) {
        this.logger.warn(`No adapter for consumer type: ${target.consumerType}`);
        continue;
      }

      if (target.consumerType === ConsumerType.WEBSOCKET) {
        const isOnline = await this.presenceStore.isOnline(event.projectId, target.consumerId);
        if (!isOnline) {
          await this.jobQueue.enqueue('push-fallback', {
            event,
            target,
          });
          this.logger.debug(`Consumer ${target.consumerId} offline, enqueued push fallback`);
          continue;
        }
      }

      const result = await adapter.deliver({
        eventId: event.eventId,
        projectId: event.projectId,
        consumerId: target.consumerId,
        channel: target.consumerType === ConsumerType.WEBSOCKET ? 'realtime' : 'webhook',
        payload: event.payload,
      });

      await this.deliveryLogRepo.create({
        projectId: event.projectId,
        eventId: event.eventId,
        consumerId: target.consumerId,
        channelType: result.channel,
        status: result.success ? 'delivered' : 'failed',
        lastError: result.error,
      });
    }
  }
}
