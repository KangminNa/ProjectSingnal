import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { initializeOtel } from './otel.setup';

@Module({})
export class ObservabilityModule implements OnModuleInit {
  private readonly logger = new Logger(ObservabilityModule.name);

  onModuleInit() {
    initializeOtel();
    this.logger.log('Observability module initialized');
  }
}
