import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@common/constants/injection-tokens';
import { users } from '@infrastructure/database/schema';

@Injectable()
export class UserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async create(data: { email: string; passwordHash: string; name: string }) {
    const [user] = await this.db.insert(users).values(data).returning();
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  }

  async findById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  }
}
