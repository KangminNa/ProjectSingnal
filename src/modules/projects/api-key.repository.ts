import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BaseRepository, DRIZZLE } from '@core/base.repository';
import { projectApiKeys } from '@infrastructure/persistence/schema';
import type { ApiKey } from '@core/entities';

@Injectable()
export class ApiKeyRepository extends BaseRepository<ApiKey> {
  constructor(@Inject(DRIZZLE) db: any) {
    super(db, projectApiKeys);
  }

  protected toEntity(row: any): ApiKey {
    return {
      id: row.id,
      projectId: row.projectId,
      keyHash: row.keyHash,
      scope: row.scope,
      status: row.status,
      createdAt: row.createdAt,
    };
  }

  async create(input: {
    projectId: string;
    keyHash: string;
    scope: 'publish' | 'admin' | 'read';
  }): Promise<ApiKey> {
    return this.insert(input);
  }

  async findByHash(keyHash: string): Promise<ApiKey | null> {
    const [row] = await this.db
      .select()
      .from(this.table)
      .where(eq(projectApiKeys.keyHash, keyHash));
    return row ? this.toEntity(row) : null;
  }

  async listByProject(projectId: string): Promise<ApiKey[]> {
    return this.listWhere(projectApiKeys.projectId, projectId);
  }
}
