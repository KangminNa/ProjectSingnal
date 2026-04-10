/**
 * ============================================================
 *  ProjectSignal — Repository Declarations
 * ============================================================
 *  모든 Repository의 공통 계약 + 모듈별 확장 계약을 정의합니다.
 *
 *  구현은 BaseRepository<T> 추상 클래스를 상속하면
 *  findById, create, list 등 기본 CRUD가 제공됩니다.
 * ============================================================
 */

import type {
  Project, Consumer, Subscription, DeliveryLog,
  DeliveryPolicy, ApiKey, User,
} from './entities';

/** ─── 공통 Consumer 타입 ─── */

export interface ConsumerTarget {
  consumerId: string;
  consumerType: string;
  endpoint?: string;
  subscriptionId: string;
  policyId?: string;
}

/** ─── Project Repository ─── */

export interface CreateProjectInput {
  userId: string;
  name: string;
  slug: string;
}

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  listByUserId(userId: string): Promise<Project[]>;
  listAll(limit?: number): Promise<Project[]>;
  updateStatus(id: string, status: string): Promise<void>;
}

/** ─── Consumer Repository ─── */

export interface RegisterConsumerInput {
  projectId: string;
  name: string;
  consumerType: string;
  endpoint?: string;
  authConfigJson?: Record<string, unknown>;
}

export interface ConsumerRepository {
  create(input: RegisterConsumerInput): Promise<Consumer>;
  findById(id: string): Promise<Consumer | null>;
  listByProject(projectId: string): Promise<Consumer[]>;
  updateStatus(id: string, status: string): Promise<void>;
}

/** ─── Subscription Repository ─── */

export interface CreateSubscriptionInput {
  projectId: string;
  consumerId: string;
  eventPattern: string;
  routingFilterJson?: Record<string, unknown>;
  policyId?: string;
}

export interface SubscriptionRepository {
  create(input: CreateSubscriptionInput): Promise<Subscription>;
  findById(id: string): Promise<Subscription | null>;
  listByProject(projectId: string): Promise<Subscription[]>;
  findTargets(projectId: string, eventType: string): Promise<ConsumerTarget[]>;
  updateStatus(id: string, status: string): Promise<void>;
}

/** ─── DeliveryLog Repository ─── */

export interface CreateDeliveryLogInput {
  projectId: string;
  eventId: string;
  consumerId: string;
  channelType: string;
  status: string;
  lastError?: string;
}

export interface DeliveryLogRepository {
  create(input: CreateDeliveryLogInput): Promise<DeliveryLog>;
  listByProject(projectId: string, limit?: number, offset?: number): Promise<DeliveryLog[]>;
  listByEvent(eventId: string): Promise<DeliveryLog[]>;
  countByProject(projectId: string): Promise<Record<string, number>>;
}

/** ─── DeliveryPolicy Repository ─── */

export interface DeliveryPolicyRepository {
  findById(id: string): Promise<DeliveryPolicy | null>;
  listByProject(projectId: string): Promise<DeliveryPolicy[]>;
}

/** ─── EventIngestLog Repository ─── */

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

export interface CreateEventIngestLogInput {
  projectId: string;
  eventId: string;
  eventType: string;
  producer: string;
  idempotencyKey?: string;
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

/** ─── ApiKey Repository ─── */

export interface CreateApiKeyInput {
  projectId: string;
  keyHash: string;
  scope: 'publish' | 'admin' | 'read';
}

export interface ApiKeyRepository {
  create(input: CreateApiKeyInput): Promise<ApiKey>;
  findByHash(keyHash: string): Promise<ApiKey | null>;
  listByProject(projectId: string): Promise<ApiKey[]>;
}

/** ─── User Repository ─── */

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
