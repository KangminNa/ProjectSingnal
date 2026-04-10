/**
 * ============================================================
 *  ProjectSignal — Entity Declarations
 * ============================================================
 *  모든 도메인 엔티티의 형태를 정의합니다.
 *  실행 코드 없음 — 타입 계약만 존재합니다.
 * ============================================================
 */

export interface Project {
  id: string;
  userId: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Consumer {
  id: string;
  projectId: string;
  name: string;
  consumerType: 'WEBSOCKET' | 'WEBHOOK' | 'PUSH' | 'EMAIL';
  endpoint?: string;
  authConfigJson?: Record<string, unknown>;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Subscription {
  id: string;
  projectId: string;
  consumerId: string;
  eventPattern: string;
  routingFilterJson?: Record<string, unknown>;
  policyId?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface DeliveryLog {
  id: string;
  projectId: string;
  eventId: string;
  consumerId: string;
  channelType: string;
  status: 'pending' | 'delivered' | 'failed' | 'retrying' | 'dead_lettered';
  attemptCount: number;
  deliveredAt?: Date;
  lastError?: string;
  createdAt: Date;
}

export interface DeliveryPolicy {
  id: string;
  projectId: string;
  name: string;
  realtimeEnabled: boolean;
  pushFallbackEnabled: boolean;
  retryMaxAttempts: number;
  retryBackoffType: 'fixed' | 'exponential';
  retryBackoffValue: number;
  ttlSeconds: number;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  projectId: string;
  keyHash: string;
  scope: 'publish' | 'admin' | 'read';
  status: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

export interface Publisher {
  id: string;
  projectId: string;
  name: string;
  type: string;
  status: string;
  createdAt: Date;
}
