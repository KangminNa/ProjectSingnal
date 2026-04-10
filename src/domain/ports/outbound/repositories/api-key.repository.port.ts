import { ApiKey } from '@domain/entities/api-key.entity';

export interface CreateApiKeyInput {
  projectId: string;
  keyHash: string;
  scope: 'publish' | 'admin' | 'read';
}

export interface ApiKeyRepository {
  create(input: CreateApiKeyInput): Promise<ApiKey>;
  findByHash(keyHash: string): Promise<ApiKey | null>;
  listByProject(projectId: string): Promise<ApiKey[]>;
}
