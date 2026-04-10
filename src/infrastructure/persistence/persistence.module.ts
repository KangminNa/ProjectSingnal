import { Global, Module } from '@nestjs/common';
import { DrizzleProvider } from './drizzle.provider';

/**
 * PersistenceModule
 *
 * Drizzle ORM Provider만 제공합니다.
 * Repository 구현은 각 모듈에서 BaseRepository를 상속하여 관리합니다.
 */
@Global()
@Module({
  providers: [DrizzleProvider],
  exports: [DrizzleProvider],
})
export class PersistenceModule {}
