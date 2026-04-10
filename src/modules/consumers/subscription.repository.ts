import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { BaseRepository, DRIZZLE } from '@core/base.repository';
import { subscriptions, consumers } from '@infrastructure/persistence/schema';
import type { Subscription } from '@core/entities';
import type { ConsumerTarget } from '@core/repository';
import { matchesEventPattern } from '@common/utils/pattern-matcher';

@Injectable()
export class SubscriptionRepository extends BaseRepository<Subscription> {
  constructor(@Inject(DRIZZLE) db: any) {
    super(db, subscriptions);
  }

  protected toEntity(row: any): Subscription {
    return {
      id: row.id,
      projectId: row.projectId,
      consumerId: row.consumerId,
      eventPattern: row.eventPattern,
      routingFilterJson: row.routingFilterJson,
      policyId: row.policyId,
      status: row.status,
      createdAt: row.createdAt,
    };
  }

  async create(input: {
    projectId: string;
    consumerId: string;
    eventPattern: string;
    routingFilterJson?: Record<string, unknown>;
    policyId?: string;
  }): Promise<Subscription> {
    return this.insert(input);
  }

  async listByProject(projectId: string): Promise<Subscription[]> {
    return this.listWhere(subscriptions.projectId, projectId);
  }

  async findTargets(projectId: string, eventType: string): Promise<ConsumerTarget[]> {
    const rows = await this.db
      .select({
        consumerId: subscriptions.consumerId,
        consumerType: consumers.consumerType,
        endpoint: consumers.endpoint,
        subscriptionId: subscriptions.id,
        policyId: subscriptions.policyId,
        eventPattern: subscriptions.eventPattern,
      })
      .from(subscriptions)
      .innerJoin(consumers, eq(subscriptions.consumerId, consumers.id))
      .where(
        and(
          eq(subscriptions.projectId, projectId),
          eq(subscriptions.status, 'active'),
          eq(consumers.status, 'active'),
        ),
      );

    return rows
      .filter((r: any) => matchesEventPattern(eventType, r.eventPattern))
      .map((r: any) => ({
        consumerId: r.consumerId,
        consumerType: r.consumerType,
        endpoint: r.endpoint,
        subscriptionId: r.subscriptionId,
        policyId: r.policyId,
      }));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.updateById(id, { status });
  }
}
