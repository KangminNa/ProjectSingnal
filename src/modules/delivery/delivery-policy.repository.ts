import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BaseRepository, DRIZZLE } from '@core/base.repository';
import { deliveryPolicies } from '@infrastructure/persistence/schema';
import type { DeliveryPolicy } from '@core/entities';

@Injectable()
export class DeliveryPolicyRepository extends BaseRepository<DeliveryPolicy> {
  constructor(@Inject(DRIZZLE) db: any) {
    super(db, deliveryPolicies);
  }

  protected toEntity(row: any): DeliveryPolicy {
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

  async listByProject(projectId: string): Promise<DeliveryPolicy[]> {
    return this.listWhere(deliveryPolicies.projectId, projectId);
  }
}
