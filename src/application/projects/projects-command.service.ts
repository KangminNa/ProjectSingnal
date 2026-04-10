import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { PROJECT_REPOSITORY, API_KEY_REPOSITORY } from '@common/constants/injection-tokens';
import { ProjectRepository } from '@domain/ports/outbound/repositories/project.repository.port';
import { ApiKeyRepository } from '@domain/ports/outbound/repositories/api-key.repository.port';
import { ConflictException } from '@common/exceptions/domain.exception';
import { CreateProjectDto } from '@api/dto/projects/create-project.dto';
import { CreateApiKeyDto } from '@api/dto/projects/create-api-key.dto';
import { Project } from '@domain/entities/project.entity';
import { ApiKey } from '@domain/entities/api-key.entity';

@Injectable()
export class ProjectsCommandService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: ProjectRepository,
    @Inject(API_KEY_REPOSITORY) private readonly apiKeyRepo: ApiKeyRepository,
  ) {}

  async createProject(userId: string, dto: CreateProjectDto): Promise<Project> {
    const existing = await this.projectRepo.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException(`Project with slug "${dto.slug}" already exists`);
    }
    return this.projectRepo.create({ userId, ...dto });
  }

  async createApiKey(
    projectId: string,
    dto: CreateApiKeyDto,
  ): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const rawKey = `sk_${uuidv4().replace(/-/g, '')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await this.apiKeyRepo.create({
      projectId,
      keyHash,
      scope: dto.scope,
    });
    return { apiKey, rawKey };
  }
}
