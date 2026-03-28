import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ConsumersService } from '../services/consumers.service';
import { RegisterConsumerSchema, RegisterConsumerDto } from '../dto/register-consumer.dto';

@ApiTags('consumers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/projects/:projectId/consumers')
export class ConsumersController {
  constructor(private readonly consumersService: ConsumersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a consumer' })
  async register(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(RegisterConsumerSchema)) dto: RegisterConsumerDto,
  ) {
    return this.consumersService.register(projectId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List consumers for a project' })
  async list(@Param('projectId') projectId: string) {
    return this.consumersService.listByProject(projectId);
  }
}
