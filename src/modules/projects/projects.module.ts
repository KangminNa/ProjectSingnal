import { Module } from '@nestjs/common';
import { PROJECT_REPOSITORY, API_KEY_REPOSITORY } from '@core/injection-tokens';
import { ProjectsCommandService } from './projects-command.service';
import { ProjectsQueryService } from './projects-query.service';
import { ProjectsController } from './projects.controller';
import { ProjectRepository } from './project.repository';
import { ApiKeyRepository } from './api-key.repository';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsCommandService,
    ProjectsQueryService,
    { provide: PROJECT_REPOSITORY, useClass: ProjectRepository },
    { provide: API_KEY_REPOSITORY, useClass: ApiKeyRepository },
  ],
  exports: [ProjectsCommandService, ProjectsQueryService],
})
export class ProjectsModule {}
