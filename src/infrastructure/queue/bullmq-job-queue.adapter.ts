import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { JobQueue, JobOptions } from '@core/event-bus';

@Injectable()
export class BullMqJobQueueAdapter implements JobQueue, OnModuleDestroy {
  private readonly logger = new Logger(BullMqJobQueueAdapter.name);
  private readonly queues = new Map<string, Queue>();
  private readonly redisHost: string;
  private readonly redisPort: number;

  constructor(private readonly configService: ConfigService) {
    this.redisHost = this.configService.get<string>('redis.host', 'localhost');
    this.redisPort = this.configService.get<number>('redis.port', 6379);
  }

  async onModuleDestroy(): Promise<void> {
    const closePromises: Promise<void>[] = [];
    for (const [name, queue] of this.queues) {
      this.logger.log(`Closing queue: ${name}`);
      closePromises.push(queue.close());
    }
    await Promise.allSettled(closePromises);
    this.queues.clear();
    this.logger.log('All BullMQ queues closed');
  }

  private getQueue(queueName: string): Queue {
    let queue = this.queues.get(queueName);
    if (!queue) {
      queue = new Queue(queueName, {
        connection: { host: this.redisHost, port: this.redisPort },
      });
      this.queues.set(queueName, queue);
    }
    return queue;
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
