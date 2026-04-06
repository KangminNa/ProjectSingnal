import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ProjectsService } from '../services/projects.service';
import { ProjectsQueryService } from '../services/projects-query.service';
import { ApiKeyRepository } from '../repositories/api-key.repository';
import { CreateProjectSchema, CreateProjectDto } from '../dto/create-project.dto';
import { CreateApiKeySchema, CreateApiKeyDto } from '../dto/create-api-key.dto';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectsQueryService: ProjectsQueryService,
    private readonly apiKeyRepo: ApiKeyRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  async create(@CurrentUser('id') userId: string, @Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto) {
    return this.projectsService.createProject(userId, dto);
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
    return this.projectsService.createApiKey(projectId, dto);
  }

  @Get(':projectId/api-keys')
  @ApiOperation({ summary: 'List API keys for project' })
  async listApiKeys(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    await this.projectsQueryService.getByIdForUser(projectId, userId);
    return this.apiKeyRepo.listByProject(projectId);
  }
}
