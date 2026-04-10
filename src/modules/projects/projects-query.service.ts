import { Injectable, Inject } from '@nestjs/common';
import { PROJECT_REPOSITORY, API_KEY_REPOSITORY } from '@core/injection-tokens';
import { NotFoundException, UnauthorizedException } from '@common/exceptions/domain.exception';
import type { ProjectRepository, ApiKeyRepository } from '@core/repository';
import type { Project, ApiKey } from '@core/entities';

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
