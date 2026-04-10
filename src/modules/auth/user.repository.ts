import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BaseRepository, DRIZZLE } from '@core/base.repository';
import { users } from '@infrastructure/persistence/schema';
import type { User } from '@core/entities';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@Inject(DRIZZLE) db: any) {
    super(db, users);
  }

  protected toEntity(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      name: row.name,
      createdAt: row.createdAt,
    };
  }

  async create(data: { email: string; passwordHash: string; name: string }): Promise<User> {
    return this.insert(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(this.table)
      .where(eq(users.email, email));
    return row ? this.toEntity(row) : null;
  }
}
