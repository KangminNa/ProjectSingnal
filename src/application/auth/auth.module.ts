import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthCommandService } from './auth-command.service';
import { AuthQueryService } from './auth-query.service';

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
  providers: [AuthCommandService, AuthQueryService],
  exports: [AuthCommandService, AuthQueryService, JwtModule],
})
export class AuthModule {}
