import { Injectable, Inject } from '@nestjs/common';
import { eq, desc, count, sql } from 'drizzle-orm';
import { DRIZZLE } from '@common/constants/injection-tokens';
import { deliveryLogs } from '@infrastructure/database/schema';
import {
  DeliveryLogRepository as IDeliveryLogRepository,
  CreateDeliveryLogInput,
} from '@domain/ports/outbound/repositories/delivery-log.repository.port';
import { DeliveryLog } from '@domain/entities/delivery-log.entity';
import { DeliveryStatus } from '@common/types/delivery.types';

@Injectable()
export class DeliveryLogRepository implements IDeliveryLogRepository {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async create(input: CreateDeliveryLogInput): Promise<DeliveryLog> {
    const [row] = await this.db.insert(deliveryLogs).values(input).returning();
    return this.toEntity(row);
  }

  async updateStatus(id: string, status: DeliveryStatus, error?: string): Promise<void> {
    const update: Record<string, unknown> = { status };
    if (status === 'delivered') update.deliveredAt = new Date();
    if (error) update.lastError = error;
    await this.db.update(deliveryLogs).set(update).where(eq(deliveryLogs.id, id));
  }

  async incrementAttempt(id: string): Promise<void> {
    await this.db
      .update(deliveryLogs)
      .set({ attemptCount: sql`${deliveryLogs.attemptCount} + 1` })
      .where(eq(deliveryLogs.id, id));
  }

  async listByProject(projectId: string, limit = 50, offset = 0): Promise<DeliveryLog[]> {
    const safeLimit = Math.min(Math.max(1, limit), 200);
    const safeOffset = Math.max(0, offset);
    const rows = await this.db
      .select()
      .from(deliveryLogs)
      .where(eq(deliveryLogs.projectId, projectId))
      .orderBy(desc(deliveryLogs.createdAt))
      .limit(safeLimit)
      .offset(safeOffset);
    return rows.map((r: any) => this.toEntity(r));
  }

  async countByProject(projectId: string): Promise<Record<string, number>> {
    const rows = await this.db
      .select({ status: deliveryLogs.status, cnt: count() })
      .from(deliveryLogs)
      .where(eq(deliveryLogs.projectId, projectId))
      .groupBy(deliveryLogs.status);

    const result: Record<string, number> = { total: 0, delivered: 0, failed: 0, retrying: 0, pending: 0, dead_lettered: 0 };
    for (const row of rows) {
      const c = Number(row.cnt);
      result[row.status] = c;
      result.total += c;
    }
    return result;
  }

  async listByEvent(eventId: string): Promise<DeliveryLog[]> {
    const rows = await this.db
      .select()
      .from(deliveryLogs)
      .where(eq(deliveryLogs.eventId, eventId));
    return rows.map((r: any) => this.toEntity(r));
  }

  private toEntity(row: any): DeliveryLog {
    return {
      id: row.id,
      projectId: row.projectId,
      eventId: row.eventId,
      consumerId: row.consumerId,
      channelType: row.channelType,
      status: row.status,
      attemptCount: row.attemptCount,
      deliveredAt: row.deliveredAt,
      lastError: row.lastError,
      createdAt: row.createdAt,
    };
  }
}
