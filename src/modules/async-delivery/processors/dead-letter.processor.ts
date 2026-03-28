import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DeadLetterProcessor {
  private readonly logger = new Logger(DeadLetterProcessor.name);

  async process(job: any): Promise<void> {
    this.logger.log(`Processing dead-letter: ${job.id}`);
    // TODO: Handle dead-lettered events (archive, alert, manual retry)
  }
}
