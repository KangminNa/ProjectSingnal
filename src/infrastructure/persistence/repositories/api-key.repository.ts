import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@common/constants/injection-tokens';
import { projectApiKeys } from '../schema';
import { ApiKey } from '@domain/entities/api-key.entity';

export interface CreateApiKeyInput {
  projectId: string;
  keyHash: string;
  scope: 'publish' | 'admin' | 'read';
}

@Injectable()
export class ApiKeyRepository {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async create(input: CreateApiKeyInput): Promise<ApiKey> {
    const [row] = await this.db.insert(projectApiKeys).values(input).returning();
    return this.toEntity(row);
  }

  async findByHash(keyHash: string): Promise<ApiKey | null> {
    const [row] = await this.db
      .select()
      .from(projectApiKeys)
      .where(eq(projectApiKeys.keyHash, keyHash));
    return row ? this.toEntity(row) : null;
  }

  async listByProject(projectId: string): Promise<ApiKey[]> {
    const rows = await this.db
      .select()
      .from(projectApiKeys)
      .where(eq(projectApiKeys.projectId, projectId));
    return rows.map((r: any) => this.toEntity(r));
  }

  private toEntity(row: any): ApiKey {
    return {
      id: row.id,
      projectId: row.projectId,
      keyHash: row.keyHash,
      scope: row.scope,
      status: row.status,
      createdAt: row.createdAt,
    };
  }
}
