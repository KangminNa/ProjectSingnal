# 개발설계연구소 문서

## 프로젝트별 채팅/알림 이벤트 전달 인프라 설계서

---

## 1. 문서 개요

### 1.1 문서 목적

본 문서는 프로젝트별로 손쉽게 붙여 사용할 수 있는 **채팅 및 알림 이벤트 전달 인프라**의 개발 설계를 정리한다.

이 플랫폼의 목적은 다음과 같다.

* 각 프로젝트가 자체 비즈니스 데이터를 보유한 상태에서
* 채팅과 알림 관련 이벤트를 플랫폼에 발행하고
* 플랫폼은 이를 실시간 또는 비동기로 적절한 consumer에게 전달하며
* 프로젝트는 복잡한 메시징 인프라를 직접 구현하지 않고도 빠르게 기능을 사용할 수 있도록 한다.

즉, 본 시스템은 **채팅 앱 백엔드** 자체가 아니라,
**채팅과 알림을 운반하는 이벤트 전달 플랫폼**이다.

---

## 2. 문제 정의

### 2.1 기존 문제

프로젝트마다 아래 기능을 반복적으로 구축해야 한다.

* WebSocket 연결 관리
* 사용자별/채널별 이벤트 전달
* 오프라인 사용자 푸시 전달
* 예약 알림
* 재시도 및 실패 처리
* presence / typing / read-event
* topic / subscription 관리

이 기능들은 대부분 공통이지만, 각 프로젝트가 매번 직접 구현하면 비용이 크고 유지보수가 어렵다.

### 2.2 해결 방향

플랫폼은 아래 역할만 집중해서 제공한다.

* 프로젝트 등록
* publisher/consumer 등록
* subscription 등록
* 이벤트 스키마 등록
* 이벤트 발행 API 제공
* 실시간 전달
* 비동기 전달
* 예약/재시도
* replay / recent buffer
* delivery log 및 상태 추적

반대로 아래는 프로젝트가 책임진다.

* 채팅 원문 영구 저장
* 방/채널 권한 모델
* 메시지 수정/삭제의 정본
* unread 계산의 비즈니스 규칙
* 첨부 파일의 정본 ownership
* 이벤트 payload의 도메인 의미

---

## 3. 제품 정의

### 3.1 한 줄 정의

**프로젝트별로 채팅과 알림 이벤트를 발행하고, 이를 실시간 또는 비동기로 적절한 consumer에게 전달하는 멀티테넌트 이벤트 메시징 플랫폼**

### 3.2 제품 포지션

이 플랫폼은 다음 세 가지의 중간 지점에 위치한다.

* 채팅 백엔드 플랫폼
* 알림/푸시 오케스트레이션 플랫폼
* pub/sub 이벤트 브로커

즉, 본 제품은 다음과 같은 성격을 가진다.

* Chat/Notification Transport Layer
* Project-scoped Event Delivery Infrastructure
* Messaging Backend for Projects

---

## 4. 핵심 설계 원칙

### 4.1 프로젝트 단위 멀티테넌시

모든 핵심 리소스는 `project_id` 기준으로 격리된다.

예:

* publisher
* consumer
* topic
* subscription
* websocket session
* device token
* delivery policy
* recent replay log

### 4.2 이벤트 중심 설계

플랫폼은 payload의 도메인 의미를 깊이 이해하지 않는다.
플랫폼이 이해하는 것은 다음과 같다.

* projectId
* eventType
* routing 정보
* schedule/deliverAt
* ttl
* priority
* delivery policy

즉, **비즈니스 의미는 프로젝트가 알고, 전달 의미는 플랫폼이 안다.**

### 4.3 정본 분리

플랫폼은 이벤트 전달 인프라다.
따라서 정본은 원칙적으로 프로젝트가 소유한다.

플랫폼이 저장하는 것은:

* 이벤트 envelope
* delivery 상태
* retry 상태
* session/presence 상태
* subscription 상태
* optional short retention buffer

### 4.4 기능 확장성

신규 기능은 가능한 한 다음 방식으로 추가한다.

* 새 이벤트 타입 추가
* 새 consumer 타입 추가
* 새 delivery adapter 추가
* 새 delivery policy 추가
* 새 projection/read model 추가

핵심 코어를 깨는 방식의 대규모 컬럼 증설은 피한다.

---

## 5. 시스템 범위

### 5.1 포함 범위

* 프로젝트 등록
* API Key / Access Token 발급
* publisher / consumer 등록
* REST 기반 이벤트 발행 API
* WebSocket 기반 실시간 수신
* project topic/channel/user scope 구독
* notification delivery
* chat event delivery
* recent replay
* retry / dead-letter
* rate limiting
* delivery status tracking

### 5.2 제외 범위

* 채팅 정본 저장소
* full text message search
* 프로젝트 고유 비즈니스 규칙
* 프로젝트 자체 사용자 도메인 관리
* 채팅방 최종 권한 정책 엔진

---

## 6. 입력 / 출력 정의

## 6.1 입력

### A. 관리 입력

* 프로젝트 생성
* project feature 활성화
* API key 생성
* consumer 등록
* subscription 등록

### B. 이벤트 입력

* 프로젝트가 REST API로 이벤트 발행
* 프로젝트가 Webhook으로 이벤트 전달
* 내부 워커가 재시도 이벤트를 재발행

### C. 세션 입력

* client WebSocket 연결
* 인증
* room/topic/user channel 구독
* ack 응답

### D. 디바이스 입력

* device token 등록
* web push subscription 등록
* topic subscription 등록

## 6.2 출력

### A. 실시간 출력

* WebSocket event
* typing event
* read event
* in-app notification event

### B. 비동기 출력

* Push
* Webhook
* Email
* Internal worker job

### C. 상태 출력

* delivery status
* replay cursor
* subscription state
* recent event feed

### D. 운영 출력

* delivery logs
* retry logs
* dead-letter logs
* metrics

---

## 7. 프로토콜 설계

## 7.1 외부 제어면: REST

REST는 제어 API와 이벤트 발행 API에 사용한다.

주요 목적:

* 인증/권한
* 멱등성
* 프로젝트 관리
* consumer 관리
* event publish
* 조회성 API

### 예시 API

* `POST /v1/projects`
* `POST /v1/projects/{projectId}/api-keys`
* `POST /v1/projects/{projectId}/publishers`
* `POST /v1/projects/{projectId}/consumers`
* `POST /v1/projects/{projectId}/subscriptions`
* `POST /v1/projects/{projectId}/events`
* `GET /v1/projects/{projectId}/deliveries`

## 7.2 실시간면: WebSocket

WebSocket은 consumer에게 실시간 이벤트를 전달하는 용도다.

주요 목적:

* session authenticate
* room join/leave
* real-time event receive
* ack
* reconnect/replay

### 예시 이벤트

* `session.authenticate`
* `subscription.attach`
* `subscription.detach`
* `event.delivery`
* `event.ack`
* `replay.request`

## 7.3 내부 이벤트 백본: NATS + JetStream

이벤트 전달 핵심은 NATS + JetStream을 사용한다.

역할:

* subject 기반 pub/sub
* durable consumer
* replay
* ack 기반 redelivery
* 프로젝트 단위 subject 분리

### subject 예시

* `proj.{projectId}.chat.message.created`
* `proj.{projectId}.chat.message.read`
* `proj.{projectId}.notification.requested`
* `proj.{projectId}.system.*`

## 7.4 내부 작업 큐: BullMQ

다음은 작업 큐로 처리한다.

* 예약 전달
* push fallback
* webhook retry
* delayed delivery
* dead-letter 재처리

---

## 8. 이벤트 모델

### 8.1 공통 이벤트 Envelope

```json
{
  "eventId": "evt_123",
  "projectId": "proj_1",
  "eventType": "chat.message.created",
  "producer": "chat-service",
  "occurredAt": "2026-03-23T12:00:00Z",
  "deliverAt": null,
  "ttlSeconds": 86400,
  "priority": "normal",
  "routing": {
    "users": ["u1"],
    "topics": ["room:r1"]
  },
  "payload": {
    "messageId": "m1",
    "preview": "안녕하세요"
  },
  "metadata": {
    "traceId": "tr_1",
    "idempotencyKey": "ik_123"
  }
}
```

### 8.2 이벤트 타입 분류

#### 채팅 관련

* `chat.message.created`
* `chat.message.updated`
* `chat.message.deleted`
* `chat.message.read`
* `chat.typing.started`
* `chat.typing.stopped`

#### 알림 관련

* `notification.requested`
* `notification.scheduled`
* `notification.delivered`
* `notification.failed`

#### 시스템 관련

* `system.event.created`
* `system.delivery.retry`
* `system.delivery.dead_lettered`

---

## 9. 아키텍처 개요

### 9.1 상위 레이어

#### 1) Control Plane

* project management
* api key management
* consumer/subscription management
* policy management

#### 2) Event Ingestion Layer

* REST event publish API
* webhook ingress
* idempotency validation

#### 3) Event Backbone

* NATS Core / JetStream
* subject routing
* durable consumer
* replay

#### 4) Realtime Delivery Layer

* Socket.IO gateway
* room/topic/user fan-out
* presence/session state

#### 5) Async Delivery Layer

* BullMQ worker
* scheduled delivery
* push fallback
* webhook retries

#### 6) State / Persistence Layer

* PostgreSQL
* Redis
* object storage (optional)

#### 7) Observability Layer

* metrics
* tracing
* audit log
* delivery log

---

## 10. 책임 분리

### 10.1 프로젝트 책임

* 채팅 원문 저장
* 대화방 모델
* 권한 모델
* 메시지 수정/삭제 정본
* 비즈니스 도메인 상태
* payload 의미

### 10.2 플랫폼 책임

* 전달
* 구독
* 재시도
* 실시간 fan-out
* replay
* push fallback
* delivery tracking
* session/presence

---

## 11. 저장소 설계 원칙

### 11.1 PostgreSQL

정본 메타데이터 저장소

저장 대상:

* projects
* project_api_keys
* publishers
* consumers
* subscriptions
* delivery_policies
* delivery_logs
* replay_cursors
* outbox / ingest logs

### 11.2 Redis

임시 상태 저장소

저장 대상:

* online session
* socket connection map
* room membership cache
* presence
* throttle counters

### 11.3 JetStream

이벤트 retention / replay 저장소

저장 대상:

* recent event stream
* durable consumer state
* ack progress

### 11.4 Object Storage

선택 기능

저장 대상:

* webhook payload archive
* dead-letter dump
* debug bundle

---

## 12. 오픈소스 선택과 이유

## 12.1 NATS + JetStream

### 선택 이유

* lightweight broker
* subject 기반 라우팅
* wildcard support
* request/reply 가능
* JetStream 기반 replay / ack / durable consumer
* 운영 복잡도가 Kafka보다 상대적으로 낮음

### 역할

* 코어 이벤트 전달 백본
* recent replay
* durable delivery progress

## 12.2 Socket.IO

### 선택 이유

* room abstraction
* reconnect
* ack / timeout
* multi-node adapter 확장 가능
* 프로젝트별 user/topic/channel fan-out 구현 용이

### 역할

* 실시간 consumer connection
* in-app event delivery
* typing/presence event

## 12.3 BullMQ

### 선택 이유

* delayed job
* retry/backoff
* parent-child flow
* Redis 기반 단순 운영

### 역할

* scheduled delivery
* push fallback
* webhook retry
* dead-letter reprocessing

## 12.4 PostgreSQL

### 선택 이유

* transaction
* 관계형 계약 모델 표현 용이
* subscription/delivery/log 관리 적합
* 운영 성숙도 높음

### 역할

* control plane storage
* delivery log storage
* policy storage

## 12.5 Redis

### 선택 이유

* low latency
* session/presence 관리 적합
* ephemeral state 관리 적합
* BullMQ backend로 재사용 가능

### 역할

* presence cache
* session store
* Socket.IO adapter backend

## 12.6 TypeScript + NestJS 또는 Fastify

### 선택 이유

* SDK 친화적
* 인터페이스 설계에 유리
* WebSocket / REST / worker 공유 타입 가능
* 구조적 모듈화 용이

### 권장

* API는 Fastify 또는 NestJS
* gateway/worker도 TypeScript 통일

---

## 13. 디자인 패턴

## 13.1 Hexagonal Architecture

외부 인터페이스와 핵심 도메인을 분리한다.

### inbound adapters

* REST Controller
* WebSocket Gateway
* Webhook Ingress

### application services

* PublishEventUseCase
* RegisterConsumerUseCase
* DeliverRealtimeUseCase
* ScheduleDeliveryUseCase

### outbound adapters

* NATS adapter
* PostgreSQL repository
* Redis presence store
* BullMQ queue
* FCM/Webhook adapter

## 13.2 CQRS

쓰기와 읽기를 분리한다.

### Command

* publish event
* register consumer
* ack delivery
* schedule delivery

### Query

* fetch delivery logs
* list subscriptions
* replay recent events
* list active sessions

## 13.3 Event-Driven Architecture

핵심 상태 변경은 이벤트로 흘린다.

* event accepted
* event routed
* event delivered
* event failed
* retry scheduled

## 13.4 Strategy Pattern

전달 채널을 전략 객체로 분리한다.

* RealtimeDeliveryStrategy
* PushDeliveryStrategy
* WebhookDeliveryStrategy
* EmailDeliveryStrategy

## 13.5 Factory Pattern

이벤트 타입 또는 consumer 타입에 따라 handler를 생성한다.

* EventHandlerFactory
* DeliveryAdapterFactory
* PolicyResolverFactory

## 13.6 Outbox Pattern

REST 입력 후 DB 저장과 broker publish 사이 정합성을 맞춘다.

1. event 요청 저장
2. outbox row 생성
3. relay worker가 NATS publish
4. publish 성공 시 outbox 완료 처리

## 13.7 Adapter Pattern

외부 provider를 캡슐화한다.

* NatsEventBusAdapter
* SocketIoGatewayAdapter
* BullMqJobQueueAdapter
* FcmPushAdapter
* WebhookAdapter

---

## 14. 인터페이스 중심 설계

### 14.1 EventBus

```ts
export interface EventBus {
  publish(event: EventEnvelope): Promise<void>
  subscribe(subject: string, handler: EventHandler): Promise<void>
}
```

### 14.2 RealtimeGateway

```ts
export interface RealtimeGateway {
  publishToUser(projectId: string, userId: string, event: RealtimeEvent): Promise<void>
  publishToTopic(projectId: string, topic: string, event: RealtimeEvent): Promise<void>
  publishToChannel(projectId: string, channelId: string, event: RealtimeEvent): Promise<void>
}
```

### 14.3 JobQueue

```ts
export interface JobQueue {
  enqueue<T>(queueName: string, job: T, opts?: JobOptions): Promise<void>
}
```

### 14.4 SubscriptionRepository

```ts
export interface SubscriptionRepository {
  create(input: CreateSubscriptionInput): Promise<Subscription>
  listByProject(projectId: string): Promise<Subscription[]>
  findTargets(projectId: string, eventType: string): Promise<ConsumerTarget[]>
}
```

### 14.5 PresenceStore

```ts
export interface PresenceStore {
  setOnline(projectId: string, consumerId: string, sessionId: string): Promise<void>
  setOffline(projectId: string, consumerId: string, sessionId: string): Promise<void>
  isOnline(projectId: string, consumerId: string): Promise<boolean>
}
```

### 14.6 DeliveryAdapter

```ts
export interface DeliveryAdapter {
  canHandle(type: ConsumerType): boolean
  deliver(input: DeliveryInput): Promise<DeliveryResult>
}
```

---

## 15. 데이터 모델 초안

### 15.1 projects

* id
* name
* slug
* status
* created_at
* updated_at

### 15.2 project_api_keys

* id
* project_id
* key_hash
* scope
* status
* created_at

### 15.3 publishers

* id
* project_id
* name
* type
* status
* created_at

### 15.4 consumers

* id
* project_id
* name
* consumer_type
* endpoint
* auth_config_json
* status
* created_at

### 15.5 subscriptions

* id
* project_id
* consumer_id
* event_pattern
* routing_filter_json
* policy_id
* status
* created_at

### 15.6 delivery_policies

* id
* project_id
* name
* realtime_enabled
* push_fallback_enabled
* retry_max_attempts
* retry_backoff_type
* retry_backoff_value
* ttl_seconds
* created_at

### 15.7 delivery_logs

* id
* project_id
* event_id
* consumer_id
* channel_type
* status
* attempt_count
* delivered_at
* last_error
* created_at

### 15.8 websocket_sessions

* id
* project_id
* consumer_id
* socket_id
* connected_at
* last_seen_at
* status

### 15.9 replay_cursors

* id
* project_id
* consumer_id
* subject
* last_event_id
* updated_at

### 15.10 event_ingest_logs

* id
* project_id
* event_id
* event_type
* producer
* idempotency_key
* accepted_at

---

## 16. 시퀀스 흐름

## 16.1 실시간 채팅 이벤트 전달

1. 프로젝트가 메시지를 자기 DB에 저장
2. 프로젝트가 플랫폼에 `chat.message.created` 발행
3. API 서버가 인증/검증/멱등성 검사
4. ingest log + outbox 저장
5. relay가 NATS publish
6. realtime consumer가 subject 구독 후 이벤트 수신
7. Socket.IO gateway가 대상 room/user/topic fan-out
8. delivery log 기록

## 16.2 오프라인 알림 fallback

1. realtime delivery 시도
2. presence store에서 offline 판별
3. BullMQ에 push job enqueue
4. push worker가 provider adapter 호출
5. 결과 반영
6. 실패 시 retry or dead-letter

## 16.3 예약 이벤트 전달

1. 이벤트 publish 시 `deliverAt` 존재
2. 즉시 전달 대신 scheduled queue로 이동
3. BullMQ가 지정 시간에 worker 실행
4. NATS publish 또는 직접 adapter 실행
5. delivery log 기록

---

## 17. 확장 전략

### 17.1 신규 기능 확장 방식

새 기능은 다음 순서로 붙인다.

1. eventType 추가
2. subscription rule 추가
3. delivery strategy 추가
4. projection/read model 추가
5. optional API 추가

### 17.2 채팅 기능 확장 예시

#### typing

* `chat.typing.started`
* `chat.typing.stopped`
* realtime only
* DB 정본 불필요

#### read-receipt

* `chat.message.read`
* 프로젝트 또는 플랫폼 read event projection 사용 가능

#### emoji reaction

* `chat.message.reaction.added`
* 정본은 프로젝트가 소유 가능
* 플랫폼은 전달만 담당

### 17.3 알림 기능 확장 예시

#### webhook

* consumer_type = `WEBHOOK`
* WebhookDeliveryAdapter 추가

#### email

* consumer_type = `EMAIL`
* EmailDeliveryStrategy 추가

#### mobile push

* fallback policy에 push 추가

---

## 18. 보안 설계

### 18.1 인증

* project API key
* websocket connect token
* webhook secret

### 18.2 권한

* project boundary enforcement
* consumer scope validation
* subscription scope validation

### 18.3 멱등성

* event publish는 `Idempotency-Key` 지원
* 중복 publish 방지

### 18.4 rate limiting

* project 단위 기본 제한
* publisher 단위 제한
* websocket connection 제한

---

## 19. 운영 설계

### 19.1 관측성

* event ingest count
* delivery success/failure ratio
* retry count
* websocket connection count
* replay usage

### 19.2 로그

* ingest log
* delivery log
* retry log
* dead-letter log

### 19.3 장애 대응

* NATS durable consumer 기반 redelivery
* BullMQ retry/backoff
* Redis 장애 시 reconnect / degraded mode
* PostgreSQL 장애 시 ingest 제한

---

## 20. MVP 정의

### 20.1 MVP 목표

각 프로젝트가 다음만으로 플랫폼을 사용할 수 있게 한다.

* 프로젝트 생성
* API key 발급
* event publish
* WebSocket connect
* topic/user/channel 구독
* realtime delivery
* basic retry
* recent replay
* delivery log

### 20.2 MVP 제외

* full workflow UI
* visual rule builder
* advanced analytics dashboard
* multi-region active-active
* full message persistence backend

---

## 21. 추천 개발 스택

### 서버

* TypeScript
* Fastify 또는 NestJS

### 실시간

* Socket.IO

### 이벤트 백본

* NATS + JetStream

### 작업 큐

* BullMQ

### 데이터 저장소

* PostgreSQL
* Redis

### ORM / Query

* Drizzle ORM

### 기타

* OpenTelemetry
* Prometheus
* Docker Compose for local
* Kubernetes or Nomad later

---

## 22. 유사 프로젝트와 참고 포인트

### Novu

* notification workflow 개념 참고
* subscriber / channel / workflow 모델 참고

### Matrix

* 이벤트 중심 메시징 모델 참고
* room / event envelope 철학 참고

### Socket.IO

* 실시간 room 전달 레이어 참고

### NATS

* lightweight event delivery backbone 참고

이 플랫폼은 위 제품들의 일부 특징을 가져오되,
최종적으로는 **프로젝트별로 손쉽게 붙일 수 있는 event delivery infrastructure**를 목표로 한다.

---

## 23. 최종 결론

이 프로젝트의 본질은 다음과 같다.

* 프로젝트는 자신의 정본 데이터를 소유한다.
* 플랫폼은 채팅과 알림을 모두 운반할 수 있는 이벤트 전달 계층을 제공한다.
* 플랫폼은 publisher/consumer/subscription 중심으로 동작한다.
* 실시간은 WebSocket으로, 비동기는 worker로, 코어 이벤트는 NATS로 처리한다.
* 확장성은 payload 확장보다 event type / adapter / policy 확장으로 해결한다.

즉 이 플랫폼은,
**각 프로젝트가 등록만 하면 쉽게 붙여 쓸 수 있는 멀티테넌트 이벤트 메시징 인프라**다.

---

## 24. 다음 단계

1. ERD 상세화
2. API 명세서 작성
3. WebSocket 이벤트 계약 작성
4. subject naming convention 확정
5. delivery policy schema 정의
6. MVP 시퀀스 다이어그램 작성
7. PoC 구현

---

## 25. 프로젝트 진행 문서

### 25.1 프로젝트명

**RelayHub**

### 25.2 프로젝트 한 줄 소개

각 프로젝트가 손쉽게 붙여 사용할 수 있도록, 채팅과 알림 이벤트를 실시간/비동기로 전달하는 멀티테넌트 이벤트 메시징 인프라를 제공한다.

### 25.3 비전

프로젝트 개발자는 채팅 서버, 알림 서버, WebSocket 인프라, 재시도 큐, replay 기능을 직접 만들지 않고도,
RelayHub에 프로젝트를 등록하고 publisher/consumer/subscription만 설정하면 이벤트 전달 기능을 즉시 사용할 수 있어야 한다.

### 25.4 목표

#### 비즈니스 목표

* 프로젝트별 메시징 인프라를 빠르게 제공
* 채팅/알림 전달 기능의 재사용성 확보
* 향후 SaaS 또는 self-hosted 제품으로 확장 가능한 기반 마련

#### 기술 목표

* 프로젝트 단위 멀티테넌시 확립
* 이벤트 기반 아키텍처 확립
* 실시간 + 비동기 전달 구조 분리
* replay / retry / delivery log 제공
* 향후 provider 및 consumer 타입 확장 가능 구조 확보

### 25.5 비목표

* 범용 채팅앱 자체 개발
* 채팅 원문 정본 저장소 제공
* full workflow builder UI 초기 제공
* 완전한 CRM/마케팅 자동화 플랫폼 구축
* 초기부터 멀티리전/초대형 분산 시스템 완성

---

## 26. 사용자 및 사용 시나리오

### 26.1 주요 사용자

* 프로젝트 개발자
* 프로젝트 백엔드 서버
* 웹/모바일 클라이언트
* 운영자 또는 관리자 시스템

### 26.2 핵심 사용 시나리오

#### 시나리오 A. 채팅 이벤트 전달

1. 프로젝트가 자신의 DB에 메시지 저장
2. 프로젝트가 `chat.message.created` 이벤트 발행
3. RelayHub가 온라인 사용자에게 WebSocket 전달
4. 오프라인 대상은 정책에 따라 push fallback 수행

#### 시나리오 B. 시스템 알림 전달

1. 프로젝트가 `notification.requested` 이벤트 발행
2. RelayHub가 routing rule 확인
3. 대상 consumer에게 WebSocket 또는 webhook 또는 push 전달
4. delivery 결과를 기록

#### 시나리오 C. 재연결 후 missed event 복구

1. client가 reconnect
2. 마지막 cursor 전달
3. RelayHub가 recent replay buffer에서 누락 이벤트 전달

---

## 27. 기능 범위 정의

### 27.1 MVP 포함 기능

* 프로젝트 등록
* API key 발급
* publisher 등록
* consumer 등록
* subscription 등록
* REST event publish API
* WebSocket 연결 및 인증
* user/topic/channel scope 전달
* recent replay
* retry
* delivery log
* basic push/webhook adapter

### 27.2 MVP 이후 확장 기능

* advanced routing rules
* workflow engine
* multi-consumer group fan-out tuning
* condition expression language
* analytics dashboard
* webhook signing and replay UI
* self-hosted installer

---

## 28. 제품 요구사항

### 28.1 기능 요구사항

1. 프로젝트는 독립된 namespace를 가진다.
2. 프로젝트는 하나 이상의 publisher를 등록할 수 있다.
3. 프로젝트는 하나 이상의 consumer를 등록할 수 있다.
4. subscription은 event pattern과 routing filter를 기준으로 동작한다.
5. event는 즉시 전달 또는 예약 전달을 지원한다.
6. online consumer는 WebSocket을 통해 실시간 전달받을 수 있다.
7. offline consumer 또는 비실시간 consumer는 async delivery를 통해 전달받는다.
8. 모든 delivery는 상태 추적이 가능해야 한다.
9. replay 가능한 recent event buffer를 제공해야 한다.
10. 실패한 delivery는 재시도 또는 dead-letter 처리되어야 한다.

### 28.2 비기능 요구사항

1. 프로젝트 간 데이터 격리 보장
2. 멱등성 보장
3. 재시도 가능성 확보
4. 관측 가능성 확보
5. 수평 확장 가능 구조
6. provider 확장 가능 구조
7. consumer 타입 확장 가능 구조

---

## 29. 모듈 구조 제안

### 29.1 control-plane

* project
* api-key
* publisher
* consumer
* subscription
* policy

### 29.2 ingest

* rest event api
* webhook ingress
* validation
* idempotency
* outbox

### 29.3 realtime

* websocket gateway
* session manager
* room/topic routing
* replay endpoint

### 29.4 async-delivery

* bullmq queues
* scheduler
* retry worker
* dead-letter worker

### 29.5 broker

* nats publisher
* nats consumer
* subject naming
* durable consumer manager

### 29.6 storage

* postgres repositories
* redis presence/session store
* optional object archive

### 29.7 observability

* metrics
* tracing
* audit log
* delivery monitoring

---

## 30. 디렉터리 구조 초안

```text
relayhub/
├─ apps/
│  ├─ api/
│  ├─ gateway/
│  ├─ worker/
│  └─ admin/
├─ packages/
│  ├─ core/
│  ├─ contracts/
│  ├─ event-bus/
│  ├─ realtime/
│  ├─ queue/
│  ├─ storage/
│  ├─ adapters/
│  ├─ observability/
│  └─ sdk/
├─ infra/
│  ├─ docker/
│  ├─ compose/
│  ├─ nats/
│  ├─ postgres/
│  └─ redis/
└─ docs/
   ├─ architecture/
   ├─ api/
   ├─ websocket/
   ├─ events/
   └─ runbooks/
```

---

## 31. 기술 스택 최종안

### 31.1 Backend

* TypeScript
* Fastify 또는 NestJS
* Zod 또는 class-validator

### 31.2 Realtime

* Socket.IO
* Redis adapter

### 31.3 Event Backbone

* NATS + JetStream

### 31.4 Async Queue

* BullMQ
* Redis

### 31.5 Database

* PostgreSQL
* Drizzle ORM

### 31.6 Observability

* OpenTelemetry
* Prometheus
* Grafana
* structured logging

### 31.7 Packaging

* Docker
* Docker Compose (local)
* Kubernetes 또는 Nomad (later)

---

## 32. 환경 구성

### 32.1 Local Development

* API 서버
* Gateway 서버
* Worker 서버
* PostgreSQL
* Redis
* NATS

### 32.2 Staging

* containerized deployment
* shared observability
* replay / retry 검증
* failover 시나리오 검증

### 32.3 Production

* API, Gateway, Worker 분리 배포
* NATS persistence 설정
* Redis 고가용성 고려
* PostgreSQL backup 및 migration 전략 수립

---

## 33. API 설계 초안

### 33.1 Control APIs

* `POST /v1/projects`
* `POST /v1/projects/{projectId}/api-keys`
* `POST /v1/projects/{projectId}/publishers`
* `POST /v1/projects/{projectId}/consumers`
* `POST /v1/projects/{projectId}/subscriptions`
* `GET /v1/projects/{projectId}/subscriptions`

### 33.2 Event APIs

* `POST /v1/projects/{projectId}/events`
* `GET /v1/projects/{projectId}/events/{eventId}`
* `POST /v1/projects/{projectId}/events/{eventId}/replay`

### 33.3 Delivery APIs

* `GET /v1/projects/{projectId}/deliveries`
* `GET /v1/projects/{projectId}/deliveries/{deliveryId}`
* `POST /v1/projects/{projectId}/deliveries/{deliveryId}/retry`

---

## 34. WebSocket 계약 초안

### 34.1 client → server

* `session.authenticate`
* `subscription.attach`
* `subscription.detach`
* `replay.request`
* `delivery.ack`

### 34.2 server → client

* `event.delivery`
* `event.replay`
* `subscription.confirmed`
* `subscription.removed`
* `system.error`

---

## 35. 이벤트 naming convention

### 원칙

* 도메인.엔티티.액션 형식 사용
* project scope는 subject 또는 envelope의 `projectId`로 분리
* 과거형 이벤트 사용 권장

### 예시

* `chat.message.created`
* `chat.message.read`
* `notification.requested`
* `notification.delivered`
* `system.retry.scheduled`

---

## 36. subject naming convention

### 예시

* `proj.{projectId}.chat.message.created`
* `proj.{projectId}.chat.message.read`
* `proj.{projectId}.notification.requested`
* `proj.{projectId}.system.retry.scheduled`

### 규칙

* subject는 project scope를 항상 포함
* wildcard subscription 고려
* event type과 subject mapping 일관성 유지

---

## 37. 개발 단계 계획

### Phase 1. Foundation

* monorepo 셋업
* TypeScript 공통 타입 구축
* local infra compose 작성
* basic logging / config / env 관리

### Phase 2. Control Plane

* project / api-key / publisher / consumer / subscription CRUD
* postgres schema 구축
* 인증/권한 구축

### Phase 3. Event Ingest + Broker

* publish API
* outbox pattern 적용
* NATS publish/consume
* idempotency 처리

### Phase 4. Realtime Delivery

* Socket.IO gateway
* session authenticate
* room/topic/user routing
* basic replay

### Phase 5. Async Delivery

* BullMQ 연동
* retry/backoff
* webhook/push adapter
* dead-letter 처리

### Phase 6. Observability

* metrics
* tracing
* audit log
* 운영 runbook 작성

### Phase 7. SDK / DX

* TypeScript SDK
* quick start example
* sample project integration

---

## 38. MVP 완료 기준

### 기술 완료 기준

* 프로젝트 생성 가능
* API key 기반 event publish 가능
* WebSocket consumer 연결 가능
* subscription 기반 delivery 가능
* retry 가능
* replay 가능
* delivery log 조회 가능

### 제품 완료 기준

* 샘플 프로젝트 1개 이상에서 채팅 이벤트 전달 성공
* 샘플 프로젝트 1개 이상에서 알림 이벤트 전달 성공
* reconnect 시 missed event replay 성공

---

## 39. 리스크와 대응

### 39.1 리스크

* 역할 경계 불명확으로 인한 범위 확장
* WebSocket 상태와 정본 혼동
* broker와 queue 역할 중복
* payload 스키마 난립
* replay 보장 범위 모호

### 39.2 대응

* 정본은 프로젝트 소유 원칙 고정
* envelope 표준화
* NATS는 이벤트, BullMQ는 작업으로 역할 고정
* schema version 도입
* retention 정책 명시

---

## 40. 문서 후속 작업

1. ERD 상세 문서 작성
2. API 명세 문서 작성
3. WebSocket 이벤트 문서 작성
4. SDK 설계 문서 작성
5. 운영 runbook 작성
6. 샘플 통합 프로젝트 문서 작성
