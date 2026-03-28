export interface CreateEventIngestLogInput {
  projectId: string;
  eventId: string;
  eventType: string;
  producer: string;
  idempotencyKey?: string;
}

export interface EventIngestLog {
  id: string;
  projectId: string;
  eventId: string;
  eventType: string;
  producer: string;
  idempotencyKey?: string;
  status: 'pending' | 'relayed' | 'failed';
  acceptedAt: Date;
}

export interface EventIngestLogRepository {
  create(input: CreateEventIngestLogInput): Promise<EventIngestLog>;
  findByIdempotencyKey(projectId: string, key: string): Promise<EventIngestLog | null>;
  listPending(limit: number): Promise<EventIngestLog[]>;
  listByProject(projectId: string, limit?: number, offset?: number): Promise<EventIngestLog[]>;
  countByProject(projectId: string): Promise<{ total: number; relayed: number; pending: number; failed: number }>;
  markRelayed(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}
