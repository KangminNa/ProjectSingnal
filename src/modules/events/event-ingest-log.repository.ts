import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, count } from 'drizzle-orm';
import { DRIZZLE } from '@core/base.repository';
import { eventIngestLogs } from '@infrastructure/persistence/schema';
import type { EventIngestLog, CreateEventIngestLogInput } from '@core/repository';

@Injectable()
export class EventIngestLogRepository {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async create(input: CreateEventIngestLogInput): Promise<EventIngestLog> {
    const [row] = await this.db.insert(eventIngestLogs).values(input).returning();
    return this.toEntity(row);
  }

  async findByIdempotencyKey(projectId: string, key: string): Promise<EventIngestLog | null> {
    const [row] = await this.db
      .select()
      .from(eventIngestLogs)
      .where(
        and(
          eq(eventIngestLogs.projectId, projectId),
          eq(eventIngestLogs.idempotencyKey, key),
        ),
      );
    return row ? this.toEntity(row) : null;
  }

  async listPending(limit: number): Promise<EventIngestLog[]> {
    const rows = await this.db
      .select()
      .from(eventIngestLogs)
      .where(eq(eventIngestLogs.status, 'pending'))
      .limit(limit);
    return rows.map((r: any) => this.toEntity(r));
  }

  async listByProject(projectId: string, limit = 50, offset = 0): Promise<EventIngestLog[]> {
    const rows = await this.db
      .select()
      .from(eventIngestLogs)
      .where(eq(eventIngestLogs.projectId, projectId))
      .orderBy(desc(eventIngestLogs.acceptedAt))
      .limit(limit)
      .offset(offset);
    return rows.map((r: any) => this.toEntity(r));
  }

  async countByProject(projectId: string): Promise<{ total: number; relayed: number; pending: number; failed: number }> {
    const rows = await this.db
      .select({ status: eventIngestLogs.status, cnt: count() })
      .from(eventIngestLogs)
      .where(eq(eventIngestLogs.projectId, projectId))
      .groupBy(eventIngestLogs.status);

    const result = { total: 0, relayed: 0, pending: 0, failed: 0 };
    for (const row of rows) {
      const c = Number(row.cnt);
      result[row.status as keyof typeof result] = c;
      result.total += c;
    }
    return result;
  }

  async markRelayed(id: string): Promise<void> {
    await this.db
      .update(eventIngestLogs)
      .set({ status: 'relayed' })
      .where(eq(eventIngestLogs.id, id));
  }

  async markFailed(id: string, _error: string): Promise<void> {
    await this.db
      .update(eventIngestLogs)
      .set({ status: 'failed' })
      .where(eq(eventIngestLogs.id, id));
  }

  private toEntity(row: any): EventIngestLog {
    return {
      id: row.id,
      projectId: row.projectId,
      eventId: row.eventId,
      eventType: row.eventType,
      producer: row.producer,
      idempotencyKey: row.idempotencyKey,
      status: row.status,
      acceptedAt: row.acceptedAt,
    };
  }
}
