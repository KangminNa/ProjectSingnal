import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@common/constants/injection-tokens';
import { consumers } from '../schema';
import {
  ConsumerRepository as IConsumerRepository,
  RegisterConsumerInput,
} from '@domain/ports/outbound/repositories/consumer.repository.port';
import { Consumer } from '@domain/entities/consumer.entity';

@Injectable()
export class ConsumerRepository implements IConsumerRepository {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async create(input: RegisterConsumerInput): Promise<Consumer> {
    const [row] = await this.db.insert(consumers).values(input).returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<Consumer | null> {
    const [row] = await this.db.select().from(consumers).where(eq(consumers.id, id));
    return row ? this.toEntity(row) : null;
  }

  async listByProject(projectId: string): Promise<Consumer[]> {
    const rows = await this.db
      .select()
      .from(consumers)
      .where(eq(consumers.projectId, projectId));
    return rows.map((r: any) => this.toEntity(r));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db.update(consumers).set({ status }).where(eq(consumers.id, id));
  }

  private toEntity(row: any): Consumer {
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      consumerType: row.consumerType,
      endpoint: row.endpoint,
      authConfigJson: row.authConfigJson,
      status: row.status,
      createdAt: row.createdAt,
    };
  }
}
