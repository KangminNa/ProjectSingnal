import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { USER_REPOSITORY } from '@core/injection-tokens';
import { AuthCommandService } from './auth-command.service';
import { AuthQueryService } from './auth-query.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './user.repository';

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
    { provide: USER_REPOSITORY, useClass: UserRepository },
  ],
  exports: [AuthCommandService, AuthQueryService, JwtModule],
})
export class AuthModule {}
