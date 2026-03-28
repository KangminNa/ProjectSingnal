import { Global, Module } from '@nestjs/common';
import { BullMqJobQueueAdapter } from './bullmq-job-queue.adapter';
import { JOB_QUEUE } from '@common/constants/injection-tokens';

@Global()
@Module({
  providers: [
    {
      provide: JOB_QUEUE,
      useClass: BullMqJobQueueAdapter,
    },
    BullMqJobQueueAdapter,
  ],
  exports: [JOB_QUEUE],
})
export class BullMqModule {}
