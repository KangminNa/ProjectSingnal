import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { SubscriptionsService } from '../services/subscriptions.service';
import { CreateSubscriptionSchema, CreateSubscriptionDto } from '../dto/create-subscription.dto';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/projects/:projectId/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a subscription' })
  async create(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(CreateSubscriptionSchema)) dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.create(projectId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List subscriptions for a project' })
  async list(@Param('projectId') projectId: string) {
    return this.subscriptionsService.listByProject(projectId);
  }

  @Delete(':subscriptionId')
  @ApiOperation({ summary: 'Deactivate a subscription' })
  async deactivate(@Param('subscriptionId') subscriptionId: string) {
    await this.subscriptionsService.deactivate(subscriptionId);
    return { success: true };
  }
}
