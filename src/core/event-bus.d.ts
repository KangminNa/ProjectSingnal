/**
 * ============================================================
 *  ProjectSignal — Event Bus Declarations
 * ============================================================
 *  이벤트 발행/구독 백본의 계약을 정의합니다.
 *
 *  구현체: NatsEventBusAdapter (infrastructure/messaging/)
 * ============================================================
 */

export interface EventRouting {
  users?: string[];
  topics?: string[];
  channels?: string[];
}

export interface EventMetadata {
  traceId?: string;
  idempotencyKey?: string;
}

/** 이벤트를 감싸는 표준 봉투 */
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

export type EventHandler = (event: EventEnvelope) => Promise<void>;

/** 이벤트 버스 — 발행/구독 계약 */
export interface EventBus {
  publish(event: EventEnvelope): Promise<void>;
  subscribe(subject: string, handler: EventHandler): Promise<void>;
}

/** Presence 저장소 — 온라인 상태 추적 */
export interface PresenceStore {
  setOnline(projectId: string, consumerId: string, sessionId: string): Promise<void>;
  setOffline(projectId: string, consumerId: string, sessionId: string): Promise<void>;
  isOnline(projectId: string, consumerId: string): Promise<boolean>;
}

/** 비동기 작업 큐 */
export interface JobQueue {
  enqueue<T>(queueName: string, job: T, opts?: JobOptions): Promise<void>;
}

export interface JobOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
  backoff?: { type: 'fixed' | 'exponential'; delay: number };
}
