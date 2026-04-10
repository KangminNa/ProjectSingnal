import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhookRetryProcessor {
  private readonly logger = new Logger(WebhookRetryProcessor.name);

  async process(job: any): Promise<void> {
    this.logger.log(`Processing webhook retry: ${job.id}`);
    // TODO: Retry failed webhook deliveries with backoff
  }
}
