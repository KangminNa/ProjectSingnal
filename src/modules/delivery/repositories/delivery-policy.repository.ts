import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@common/constants/injection-tokens';
import { deliveryPolicies } from '@infrastructure/database/schema';
import {
  DeliveryPolicyRepository as IDeliveryPolicyRepository,
  CreateDeliveryPolicyInput,
} from '@domain/ports/outbound/repositories/delivery-policy.repository.port';
import { DeliveryPolicy } from '@domain/entities/delivery-policy.entity';

@Injectable()
export class DeliveryPolicyRepository implements IDeliveryPolicyRepository {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async create(input: CreateDeliveryPolicyInput): Promise<DeliveryPolicy> {
    const [row] = await this.db.insert(deliveryPolicies).values(input).returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<DeliveryPolicy | null> {
    const [row] = await this.db
      .select()
      .from(deliveryPolicies)
      .where(eq(deliveryPolicies.id, id));
    return row ? this.toEntity(row) : null;
  }

  async listByProject(projectId: string): Promise<DeliveryPolicy[]> {
    const rows = await this.db
      .select()
      .from(deliveryPolicies)
      .where(eq(deliveryPolicies.projectId, projectId));
    return rows.map((r: any) => this.toEntity(r));
  }

  private toEntity(row: any): DeliveryPolicy {
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      realtimeEnabled: row.realtimeEnabled,
      pushFallbackEnabled: row.pushFallbackEnabled,
      retryMaxAttempts: row.retryMaxAttempts,
      retryBackoffType: row.retryBackoffType,
      retryBackoffValue: row.retryBackoffValue,
      ttlSeconds: row.ttlSeconds,
      createdAt: row.createdAt,
    };
  }
}
