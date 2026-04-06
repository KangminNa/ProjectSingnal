import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { EventIngestionService } from '../services/event-ingestion.service';
import { EventRouterService } from '../services/event-router.service';
import { EventsQueryService } from '../services/events-query.service';
import { PublishEventSchema, PublishEventDto } from '../dto/publish-event.dto';

@ApiTags('events')
@Controller('v1/projects/:projectId/events')
export class EventsController {
  constructor(
    private readonly ingestionService: EventIngestionService,
    private readonly routerService: EventRouterService,
    private readonly queryService: EventsQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Publish an event' })
  async publish(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(PublishEventSchema)) dto: PublishEventDto,
  ) {
    const envelope = await this.ingestionService.ingest(projectId, dto);
    await this.routerService.route(envelope);
    return { eventId: envelope.eventId, status: 'accepted' };
  }

  @Get('ingest-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List event ingest logs' })
  async listIngestLogs(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.queryService.listIngestLogs(
      projectId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('ingest-logs/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get event ingest stats' })
  async getIngestStats(@Param('projectId') projectId: string) {
    return this.queryService.getIngestStats(projectId);
  }
}
