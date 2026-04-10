import { Injectable, Inject } from '@nestjs/common';
import { PROJECT_REPOSITORY, API_KEY_REPOSITORY } from '@common/constants/injection-tokens';
import { ProjectRepository } from '@domain/ports/outbound/repositories/project.repository.port';
import { ApiKeyRepository } from '@domain/ports/outbound/repositories/api-key.repository.port';
import { NotFoundException, UnauthorizedException } from '@common/exceptions/domain.exception';
import { Project } from '@domain/entities/project.entity';
import { ApiKey } from '@domain/entities/api-key.entity';

@Injectable()
export class ProjectsQueryService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: ProjectRepository,
    @Inject(API_KEY_REPOSITORY) private readonly apiKeyRepo: ApiKeyRepository,
  ) {}

  async getByIdForUser(id: string, userId: string): Promise<Project> {
    const project = await this.projectRepo.findById(id);
    if (!project) {
      throw new NotFoundException('Project', id);
    }
    if (project.userId !== userId) {
      throw new UnauthorizedException('You do not have access to this project');
    }
    return project;
  }

  async listByUserId(userId: string): Promise<Project[]> {
    return this.projectRepo.listByUserId(userId);
  }

  async listAll(): Promise<Project[]> {
    return this.projectRepo.listAll();
  }

  async listApiKeys(projectId: string): Promise<ApiKey[]> {
    return this.apiKeyRepo.listByProject(projectId);
  }
}
