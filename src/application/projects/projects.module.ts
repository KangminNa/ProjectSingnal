import { Module } from '@nestjs/common';
import { ProjectsCommandService } from './projects-command.service';
import { ProjectsQueryService } from './projects-query.service';

@Module({
  providers: [ProjectsCommandService, ProjectsQueryService],
  exports: [ProjectsCommandService, ProjectsQueryService],
})
export class ProjectsModule {}
