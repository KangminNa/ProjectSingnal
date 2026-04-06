import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ConsumersCommandService } from '../services/consumers-command.service';
import { ConsumersQueryService } from '../services/consumers-query.service';
import { RegisterConsumerSchema, RegisterConsumerDto } from '../dto/register-consumer.dto';

@ApiTags('consumers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/projects/:projectId/consumers')
export class ConsumersController {
  constructor(
    private readonly commandService: ConsumersCommandService,
    private readonly queryService: ConsumersQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a consumer' })
  async register(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(RegisterConsumerSchema)) dto: RegisterConsumerDto,
  ) {
    return this.commandService.register(projectId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List consumers for a project' })
  async list(@Param('projectId') projectId: string) {
    return this.queryService.listByProject(projectId);
  }
}
