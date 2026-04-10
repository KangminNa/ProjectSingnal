import { Injectable, Inject, Logger } from '@nestjs/common';
import { JOB_QUEUE } from '@common/constants/injection-tokens';
import { JobQueue } from '@domain/ports/outbound/job-queue.port';
import { EventEnvelope } from '@domain/types/event-envelope';

@Injectable()
export class AsyncDeliveryService {
  private readonly logger = new Logger(AsyncDeliveryService.name);

  constructor(@Inject(JOB_QUEUE) private readonly jobQueue: JobQueue) {}

  async scheduleDelivery(event: EventEnvelope, delayMs: number): Promise<void> {
    await this.jobQueue.enqueue('scheduled-delivery', event, { delay: delayMs });
    this.logger.log(`Scheduled delivery for event ${event.eventId} in ${delayMs}ms`);
  }

  async enqueuePushFallback(event: EventEnvelope, consumerId: string): Promise<void> {
    await this.jobQueue.enqueue('push-fallback', { event, consumerId });
    this.logger.log(`Enqueued push fallback for ${consumerId}`);
  }

  async enqueueWebhookRetry(event: EventEnvelope, consumerId: string, attempt: number): Promise<void> {
    const delay = Math.pow(2, attempt) * 1000;
    await this.jobQueue.enqueue('webhook-retry', { event, consumerId, attempt }, {
      delay,
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
    });
    this.logger.log(`Enqueued webhook retry #${attempt} for ${consumerId}`);
  }
}
