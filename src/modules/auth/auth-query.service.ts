import { Injectable, Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '@core/injection-tokens';
import { UnauthorizedException } from '@common/exceptions/domain.exception';
import type { UserRepository } from '@core/repository';

@Injectable()
export class AuthQueryService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { id: user.id, email: user.email, name: user.name };
  }
}
