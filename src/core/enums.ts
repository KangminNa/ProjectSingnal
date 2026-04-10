/**
 * ============================================================
 *  ProjectSignal — Runtime Enums & Constants
 * ============================================================
 *  .d.ts의 declare enum은 타입 전용이므로,
 *  런타임에서 사용하는 enum은 여기에 정의합니다.
 * ============================================================
 */

export enum ConsumerType {
  WEBSOCKET = 'WEBSOCKET',
  WEBHOOK = 'WEBHOOK',
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
}

export enum TransportProtocol {
  HTTP = 'HTTP',
  WEBSOCKET = 'WEBSOCKET',
}

export type DeliveryChannel = 'realtime' | 'push' | 'webhook' | 'email';
export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'retrying' | 'dead_lettered';
