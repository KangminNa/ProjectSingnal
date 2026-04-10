import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@api/guards/jwt-auth.guard';
import { DeliveryLogsQueryService } from '@application/delivery/delivery-logs-query.service';

@ApiTags('delivery-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/projects/:projectId/delivery-logs')
export class DeliveryLogsController {
  constructor(private readonly queryService: DeliveryLogsQueryService) {}

  @Get()
  @ApiOperation({ summary: 'List delivery logs for a project' })
  async list(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.queryService.listByProject(
      projectId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get delivery stats' })
  async stats(@Param('projectId') projectId: string) {
    return this.queryService.getStatsByProject(projectId);
  }
}
