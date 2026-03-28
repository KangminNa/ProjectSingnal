import { Module } from '@nestjs/common';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsService } from './services/projects.service';
import { ProjectsQueryService } from './services/projects-query.service';
import { ProjectRepository } from './repositories/project.repository';
import { ApiKeyRepository } from './repositories/api-key.repository';
import { PROJECT_REPOSITORY } from '@common/constants/injection-tokens';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    ProjectsQueryService,
    ApiKeyRepository,
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectRepository,
    },
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectsModule {}
