import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { SessionService } from '../services/session.service';

@ApiTags('connections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/projects/:projectId/connections')
export class ConnectionsController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'List active WebSocket connections' })
  async list(@Param('projectId') projectId: string) {
    return this.sessionService.listByProject(projectId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get connection stats' })
  async stats(@Param('projectId') projectId: string) {
    return this.sessionService.countByProject(projectId);
  }
}
