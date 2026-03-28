import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '@common/constants/injection-tokens';
import { subscriptions, consumers } from '@infrastructure/database/schema';
import {
  SubscriptionRepository as ISubscriptionRepository,
  CreateSubscriptionInput,
} from '@domain/ports/outbound/repositories/subscription.repository.port';
import { Subscription } from '@domain/entities/subscription.entity';
import { ConsumerTarget, ConsumerType } from '@common/types/consumer.types';
import { matchesEventPattern } from '@common/utils/pattern-matcher';

@Injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const [row] = await this.db.insert(subscriptions).values(input).returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<Subscription | null> {
    const [row] = await this.db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return row ? this.toEntity(row) : null;
  }

  async listByProject(projectId: string): Promise<Subscription[]> {
    const rows = await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.projectId, projectId));
    return rows.map((r: any) => this.toEntity(r));
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
        consumerType: r.consumerType as ConsumerType,
        endpoint: r.endpoint,
        subscriptionId: r.subscriptionId,
        policyId: r.policyId,
      }));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db.update(subscriptions).set({ status }).where(eq(subscriptions.id, id));
  }

  private toEntity(row: any): Subscription {
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
}
