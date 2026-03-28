export interface EventRouting {
  users?: string[];
  topics?: string[];
  channels?: string[];
}

export interface EventMetadata {
  traceId?: string;
  idempotencyKey?: string;
}

export interface EventEnvelope {
  eventId: string;
  projectId: string;
  eventType: string;
  producer: string;
  occurredAt: Date;
  deliverAt?: Date | null;
  ttlSeconds?: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  routing: EventRouting;
  payload: Record<string, unknown>;
  metadata: EventMetadata;
}
