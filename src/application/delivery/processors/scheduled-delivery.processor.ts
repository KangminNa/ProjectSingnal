import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ScheduledDeliveryProcessor {
  private readonly logger = new Logger(ScheduledDeliveryProcessor.name);

  async process(job: any): Promise<void> {
    this.logger.log(`Processing scheduled delivery: ${job.id}`);
    // TODO: Process delayed/scheduled delivery jobs
  }
}
