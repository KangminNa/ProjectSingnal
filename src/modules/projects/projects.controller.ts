import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from '@api/zod-validation.pipe';
import { JwtAuthGuard } from '@api/guards/jwt-auth.guard';
import { CurrentUser } from '@api/decorators/current-user.decorator';
import { ProjectsCommandService } from './projects-command.service';
import { ProjectsQueryService } from './projects-query.service';
import { CreateProjectSchema, CreateProjectDto } from './dto/create-project.dto';
import { CreateApiKeySchema, CreateApiKeyDto } from './dto/create-api-key.dto';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/projects')
export class ProjectsController {
  constructor(
    private readonly projectsCommandService: ProjectsCommandService,
    private readonly projectsQueryService: ProjectsQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  async create(@CurrentUser('id') userId: string, @Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto) {
    return this.projectsCommandService.createProject(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my projects' })
  async listMy(@CurrentUser('id') userId: string) {
    return this.projectsQueryService.listByUserId(userId);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get project by ID' })
  async getById(@CurrentUser('id') userId: string, @Param('projectId') projectId: string) {
    return this.projectsQueryService.getByIdForUser(projectId, userId);
  }

  @Post(':projectId/api-keys')
  @ApiOperation({ summary: 'Create API key for project' })
  async createApiKey(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(CreateApiKeySchema)) dto: CreateApiKeyDto,
  ) {
    await this.projectsQueryService.getByIdForUser(projectId, userId);
    return this.projectsCommandService.createApiKey(projectId, dto);
  }

  @Get(':projectId/api-keys')
  @ApiOperation({ summary: 'List API keys for project' })
  async listApiKeys(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    await this.projectsQueryService.getByIdForUser(projectId, userId);
    return this.projectsQueryService.listApiKeys(projectId);
  }
}
