/**
 * ============================================================
 *  ProjectSignal — Transport Declarations
 * ============================================================
 *  이벤트 배달 프로토콜의 계약을 정의합니다.
 *
 *  프로토콜은 2개만 존재합니다:
 *    HTTP      — endpoint에 POST (webhook, push, email 모두 동일)
 *    WEBSOCKET — Socket.IO로 실시간 emit
 *
 *  ConsumerType(WEBHOOK/PUSH/EMAIL)은 사용자 라벨일 뿐,
 *  실제 배달은 TransportProtocol로 분기합니다.
 * ============================================================
 */

export declare enum TransportProtocol {
  HTTP = 'HTTP',
  WEBSOCKET = 'WEBSOCKET',
}

/** Adapter가 받는 전송 요청 */
export interface TransportRequest {
  readonly eventId: string;
  readonly projectId: string;
  readonly consumerId: string;
  readonly payload: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
  readonly endpoint?: string;
}

/** Adapter가 반환하는 전송 결과 */
export interface TransportResponse {
  readonly success: boolean;
  readonly protocol: TransportProtocol;
  readonly deliveredAt?: Date;
  readonly error?: string;
  readonly retryable: boolean;
  readonly httpStatus?: number;
}

/**
 * TransportAdapter — 모든 배달 어댑터의 계약
 *
 * 구현체:
 *   HttpTransportAdapter      (infrastructure/transport/http/)
 *   SocketIoTransportAdapter  (infrastructure/transport/socketio/)
 *
 * 새 프로토콜 추가:
 *   1. TransportProtocol에 enum 추가
 *   2. TransportAdapter 구현
 *   3. TransportInitializerService constructor에 주입
 */
export interface TransportAdapter {
  readonly protocol: TransportProtocol;
  send(request: TransportRequest): Promise<TransportResponse>;
}
