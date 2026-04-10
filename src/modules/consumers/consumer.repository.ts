import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BaseRepository, DRIZZLE } from '@core/base.repository';
import { consumers } from '@infrastructure/persistence/schema';
import type { Consumer } from '@core/entities';

@Injectable()
export class ConsumerRepository extends BaseRepository<Consumer> {
  constructor(@Inject(DRIZZLE) db: any) {
    super(db, consumers);
  }

  protected toEntity(row: any): Consumer {
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

  async create(input: {
    projectId: string;
    name: string;
    consumerType: string;
    endpoint?: string;
    authConfigJson?: Record<string, unknown>;
  }): Promise<Consumer> {
    return this.insert(input);
  }

  async listByProject(projectId: string): Promise<Consumer[]> {
    return this.listWhere(consumers.projectId, projectId);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.updateById(id, { status });
  }
}
