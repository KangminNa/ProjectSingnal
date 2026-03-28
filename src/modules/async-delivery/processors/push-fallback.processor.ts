import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PushFallbackProcessor {
  private readonly logger = new Logger(PushFallbackProcessor.name);

  async process(job: any): Promise<void> {
    this.logger.log(`Processing push fallback: ${job.id}`);
    // TODO: Send push notification via FCM/APNs when user is offline
  }
}
