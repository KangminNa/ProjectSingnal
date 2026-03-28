import { Controller, Get, Param, Query, Inject, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DELIVERY_LOG_REPOSITORY } from '@common/constants/injection-tokens';
import { DeliveryLogRepository } from '@domain/ports/outbound/repositories/delivery-log.repository.port';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('delivery-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/projects/:projectId/delivery-logs')
export class DeliveryLogsController {
  constructor(
    @Inject(DELIVERY_LOG_REPOSITORY) private readonly deliveryLogRepo: DeliveryLogRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List delivery logs for a project' })
  async list(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.deliveryLogRepo.listByProject(
      projectId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get delivery stats' })
  async stats(@Param('projectId') projectId: string) {
    return this.deliveryLogRepo.countByProject(projectId);
  }
}
