import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { AuthCommandService } from './services/auth-command.service';
import { AuthQueryService } from './services/auth-query.service';
import { UserRepository } from './repositories/user.repository';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { USER_REPOSITORY } from '@common/constants/injection-tokens';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'projectsignal-jwt-secret-dev'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthCommandService,
    AuthQueryService,
    JwtAuthGuard,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [JwtAuthGuard, JwtModule, USER_REPOSITORY],
})
export class AuthModule {}
