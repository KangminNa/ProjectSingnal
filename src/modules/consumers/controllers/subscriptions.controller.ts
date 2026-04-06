import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { SubscriptionsCommandService } from '../services/subscriptions-command.service';
import { SubscriptionsQueryService } from '../services/subscriptions-query.service';
import { CreateSubscriptionSchema, CreateSubscriptionDto } from '../dto/create-subscription.dto';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/projects/:projectId/subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly commandService: SubscriptionsCommandService,
    private readonly queryService: SubscriptionsQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a subscription' })
  async create(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(CreateSubscriptionSchema)) dto: CreateSubscriptionDto,
  ) {
    return this.commandService.create(projectId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List subscriptions for a project' })
  async list(@Param('projectId') projectId: string) {
    return this.queryService.listByProject(projectId);
  }

  @Delete(':subscriptionId')
  @ApiOperation({ summary: 'Deactivate a subscription' })
  async deactivate(@Param('subscriptionId') subscriptionId: string) {
    await this.commandService.deactivate(subscriptionId);
    return { success: true };
  }
}
