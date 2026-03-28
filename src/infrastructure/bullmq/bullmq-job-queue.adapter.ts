import { Injectable, Inject, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { JobQueue, JobOptions } from '@domain/ports/outbound/job-queue.port';

@Injectable()
export class BullMqJobQueueAdapter implements JobQueue {
  private readonly logger = new Logger(BullMqJobQueueAdapter.name);
  private readonly queues = new Map<string, Queue>();
  private readonly redisHost: string;
  private readonly redisPort: number;

  constructor(private readonly configService: ConfigService) {
    this.redisHost = this.configService.get<string>('redis.host', 'localhost');
    this.redisPort = this.configService.get<number>('redis.port', 6379);
  }

  private getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: { host: this.redisHost, port: this.redisPort },
      });
      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName)!;
  }

  async enqueue<T>(queueName: string, job: T, opts?: JobOptions): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.add(queueName, job, {
      delay: opts?.delay,
      priority: opts?.priority,
      attempts: opts?.attempts,
      backoff: opts?.backoff,
    });
    this.logger.debug(`Enqueued job to ${queueName}`);
  }
}
