# ProjectSignal

**Multi-tenant Event Delivery Infrastructure** — 이벤트 수집부터 실시간/비동기 배달까지 하나의 플랫폼으로 관리하는 통합 이벤트 딜리버리 인프라.

> 채팅, 알림, 웹훅, 이메일, 푸시 — 어떤 채널이든 하나의 이벤트로 시작됩니다.

---

## Table of Contents

- [What is ProjectSignal?](#what-is-projectsignal)
- [Why ProjectSignal?](#why-projectsignal)
- [Architecture](#architecture)
- [Comparison with Other Tools](#comparison-with-other-tools)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Dashboard](#dashboard)
- [Project Structure](#project-structure)

---

## What is ProjectSignal?

ProjectSignal은 **이벤트 기반의 멀티테넌트 메시지 딜리버리 플랫폼**입니다.

하나의 이벤트를 발행하면, 구독 규칙에 따라 여러 채널(WebSocket, Webhook, Push, Email)로 자동 라우팅하고, 실패 시 재시도, Dead Letter Queue 처리까지 자동으로 수행합니다.

```
Publisher → [Event Ingestion] → [NATS JetStream] → [Delivery Orchestrator]
                                                          │
                                    ┌─────────────────────┼─────────────────────┐
                                    ▼                     ▼                     ▼
                              [Socket.IO]           [Webhook]             [Push/Email]
                              실시간 배달           HTTP Callback          비동기 배달
                                    │                     │                     │
                                    ▼                     ▼                     ▼
                              [Delivery Log]        [Retry Queue]         [Dead Letter]
```

### Core Concepts

| 개념 | 설명 |
|------|------|
| **Project** | 멀티테넌트 격리 단위. 각 프로젝트는 독립된 이벤트 스트림과 설정을 가짐 |
| **Publisher** | 이벤트를 발행하는 주체 (API Key로 인증) |
| **Consumer** | 이벤트를 수신하는 대상 (WebSocket, Webhook, Push, Email) |
| **Subscription** | Consumer가 특정 이벤트 패턴(`chat.message.*`)을 구독하는 규칙 |
| **Delivery Policy** | 재시도 전략, TTL, 폴백 채널 등 배달 정책 |
| **EventEnvelope** | 이벤트 메타데이터 + 페이로드를 담는 표준 포맷 |

---

## Why ProjectSignal?

기존 도구들은 각각의 영역에서 뛰어나지만, **이벤트 수집 → 라우팅 → 멀티채널 배달 → 모니터링**을 하나의 시스템에서 제공하는 도구는 거의 없습니다.

### 기존 도구들의 한계

| 문제 | 설명 |
|------|------|
| **알림 플랫폼은 Webhook을 못 한다** | Novu, Knock 등은 사람에게 알림을 보내는 데 특화. 시스템 간 Webhook 배달은 지원하지 않음 |
| **Webhook 서비스는 실시간을 못 한다** | Svix, Hookdeck은 HTTP Callback에 특화. WebSocket 실시간 배달은 범위 밖 |
| **실시간 서버는 오프라인 배달을 못 한다** | Centrifugo, Socket.IO는 연결된 클라이언트에게만 전달. 오프라인 사용자에겐 Push/Email 폴백 필요 |
| **이벤트 스트리밍은 배달 로직이 없다** | Kafka, NATS 자체는 메시지 브로커. 배달 오케스트레이션은 직접 구현해야 함 |

### ProjectSignal이 해결하는 것

```
"하나의 이벤트" → "적절한 채널로" → "확실하게 배달" → "실패하면 재시도" → "모니터링"
```

- 이벤트 하나를 발행하면, 구독 규칙에 따라 WebSocket + Webhook + Push를 동시에 처리
- Outbox Pattern으로 이벤트 유실 방지
- 실시간 배달 실패 시 Push/Email로 자동 폴백
- 모든 배달 이력을 로그로 추적 (Delivery Log)
- 프로젝트별 격리된 멀티테넌트 관리

---

## Comparison with Other Tools

### 한눈에 보는 비교

| 기능 | ProjectSignal | Novu | Svix | Centrifugo | Kafka |
|------|:---:|:---:|:---:|:---:|:---:|
| 오픈소스 | MIT | MIT | MIT | MIT | Apache 2.0 |
| 셀프호스팅 | O | O | O | O | O |
| 실시간 (WebSocket) | O | In-App만 | X | O | X |
| Webhook 배달 | O | X | O | X | 직접 구현 |
| Push 알림 | O | O | X | X | 직접 구현 |
| Email 배달 | O | O | X | X | 직접 구현 |
| 멀티채널 라우팅 | O | O | X | X | X |
| 이벤트 수집 + 라우팅 | O | X | X | X | O |
| 재시도 / Dead Letter | O | O | O | X | 직접 구현 |
| Outbox Pattern | O | X | X | X | X |
| 멀티테넌트 | O | O | O | 부분적 | 부분적 |
| 배달 모니터링 대시보드 | O | O | O | 관리 UI | X |
| 구독 패턴 매칭 | O | X | X | 채널 기반 | 토픽 기반 |
| 오프라인 폴백 | O | 부분적 | X | History만 | X |

### 상세 비교

#### vs. Novu (오픈소스 알림 플랫폼)

| | ProjectSignal | Novu |
|---|---|---|
| **핵심 철학** | "이벤트" 중심 — 하나의 이벤트가 여러 채널로 분기 | "알림" 중심 — 워크플로우로 알림 전송 |
| **대상** | 사람 + 시스템 (Webhook 포함) | 사람 (End-user notification) |
| **이벤트 백본** | NATS JetStream (내장) | 없음 (API 직접 호출) |
| **Webhook 지원** | 기본 제공 (재시도, 서명 포함) | 미지원 |
| **구독 모델** | 이벤트 패턴 매칭 (`chat.message.*`) | 워크플로우별 알림 대상 |
| **운영 복잡도** | PostgreSQL + Redis + NATS | MongoDB + Redis + 다수 마이크로서비스 |

**Novu를 선택할 때**: 알림 템플릿, 사용자 선호도, Digest/Batch 기능이 필요한 경우
**ProjectSignal을 선택할 때**: 이벤트 기반 아키텍처에서 알림 + Webhook + 실시간을 통합 관리할 때

#### vs. Svix (Webhook 배달 서비스)

| | ProjectSignal | Svix |
|---|---|---|
| **범위** | 멀티채널 (WS, Webhook, Push, Email) | Webhook 전용 |
| **실시간** | Socket.IO 기반 실시간 배달 | 없음 |
| **이벤트 수집** | Ingestion API + Outbox 내장 | 없음 (이벤트를 직접 생성해서 넘겨야 함) |
| **성능** | Node.js (NestJS) | Rust (고성능) |
| **성숙도** | 개발 초기 | 프로덕션 검증됨 |

**Svix를 선택할 때**: Webhook만 필요하고, 최고 성능이 중요한 경우
**ProjectSignal을 선택할 때**: Webhook + 실시간 + Push를 통합하고 싶을 때

#### vs. Centrifugo (실시간 메시징 서버)

| | ProjectSignal | Centrifugo |
|---|---|---|
| **실시간 프로토콜** | Socket.IO (WebSocket) | WebSocket, SSE, HTTP-streaming, GRPC |
| **오프라인 배달** | Push/Email 폴백 자동 처리 | 없음 (History로 재연결 시 복구만) |
| **이벤트 수집** | Ingestion API 내장 | 외부에서 Server API 호출 |
| **Webhook 배달** | 내장 | 없음 |
| **언어 종속성** | NestJS (Node.js) | 언어 무관 (Go 바이너리, HTTP API) |
| **확장성** | Socket.IO 어댑터 기반 | NATS/Redis 기반 (대규모 확장에 강함) |

**Centrifugo를 선택할 때**: 수백만 연결의 실시간 Push만 필요하고, 언어에 종속되고 싶지 않을 때
**ProjectSignal을 선택할 때**: 실시간 + 오프라인 폴백 + Webhook을 하나의 이벤트 모델로 관리할 때

#### vs. Kafka (이벤트 스트리밍 플랫폼)

| | ProjectSignal | Kafka + Custom |
|---|---|---|
| **설치** | `docker compose up` (3개 컨테이너) | 클러스터 구축 (브로커 + ZooKeeper/KRaft) |
| **배달 오케스트레이션** | 내장 (전략 패턴, 재시도, DLQ) | 전부 직접 구현 |
| **대시보드** | 관리 대시보드 내장 | 없음 (Kafka UI는 별도 도구) |
| **처리량** | 중소규모 (초당 수천~수만) | 대규모 (초당 수백만) |
| **운영 난이도** | 낮음 | 높음 (전문 인력 필요) |

**Kafka를 선택할 때**: 일 TB급 이벤트 처리, 장기 보존, 다양한 컨슈머가 필요한 대규모 데이터 파이프라인
**ProjectSignal을 선택할 때**: 이벤트 → 배달까지 end-to-end가 필요하고, 운영 오버헤드를 최소화하고 싶을 때

### ProjectSignal의 고유한 차별점

1. **Unified Event Model**: 이벤트 하나가 모든 채널의 시작점. 알림 서비스처럼 채널별 API를 따로 호출할 필요 없음
2. **Outbox Pattern 내장**: DB 트랜잭션과 이벤트 발행의 원자성 보장. 이벤트 유실 방지
3. **구독 기반 라우팅**: `chat.message.*` 같은 패턴 매칭으로 유연한 이벤트 라우팅
4. **폴백 체인**: 실시간 배달 실패 → Push → Webhook → Email 순서로 자동 에스컬레이션
5. **Self-contained**: NATS + PostgreSQL + Redis + BullMQ가 Docker Compose 하나로 실행

---

## Tech Stack

| 레이어 | 기술 | 역할 |
|--------|------|------|
| **Backend Framework** | NestJS 11 + TypeScript | API 서버, DI 컨테이너 |
| **Database** | PostgreSQL 16 + Drizzle ORM | 영구 저장소, 타입 안전한 쿼리 |
| **Message Broker** | NATS 2.10 (JetStream) | 이벤트 발행/구독 백본 |
| **Cache / Presence** | Redis 7 (ioredis) | 세션 상태, 온라인 상태 추적 |
| **Job Queue** | BullMQ 5 | 비동기 배달, 재시도, 스케줄링 |
| **Realtime** | Socket.IO 4 | WebSocket 실시간 통신 |
| **Validation** | Zod | 런타임 스키마 검증 |
| **Auth** | JWT + bcrypt | 인증/인가 |
| **Dashboard** | Next.js 16 + Tailwind CSS + shadcn/ui | 관리 대시보드 |
| **Container** | Docker Compose | 인프라 오케스트레이션 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm

### 1. Clone & Install

```bash
git clone <repository-url>
cd ProjectSignal

# Backend dependencies
npm install

# Dashboard dependencies
cd dashboard && npm install && cd ..
```

### 2. Environment Setup

```bash
# .env 파일 생성 (.env.example 참고)
cp .env.example .env
```

`.env` 주요 설정:

```env
DATABASE_URL=postgresql://projectsignal:projectsignal_dev@localhost:5432/projectsignal
REDIS_HOST=localhost
REDIS_PORT=6379
NATS_URL=nats://localhost:4222
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Start Infrastructure

```bash
# PostgreSQL, Redis, NATS 실행
docker compose up -d

# 상태 확인
docker compose ps
```

| 서비스 | 포트 | 용도 |
|--------|------|------|
| PostgreSQL | 5432 | 데이터베이스 |
| Redis | 6379 | 캐시 / 잡 큐 |
| NATS | 4222 (client), 8222 (monitoring) | 메시지 브로커 |

### 4. Database Migration

```bash
# Drizzle 마이그레이션 파일 생성
npm run db:generate

# 마이그레이션 실행 (테이블 생성)
npm run db:migrate
```

### 5. Start Backend

```bash
# 개발 모드 (hot reload)
npm run start:dev

# Backend: http://localhost:3000
# Swagger UI: http://localhost:3000/api/docs
```

### 6. Start Dashboard

```bash
cd dashboard

# 개발 모드
npm run dev

# Dashboard: http://localhost:3001
```

---

## Usage Guide

### Step 1: 회원가입 & 로그인

**Dashboard UI 사용:**

1. `http://localhost:3001` 접속
2. Sign Up 페이지에서 계정 생성
3. 로그인 후 프로젝트 목록 페이지로 이동

**API 직접 호출:**

```bash
# 회원가입
curl -X POST http://localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "Admin"
  }'

# 로그인 → accessToken 획득
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
# Response: { "accessToken": "eyJ...", "user": { ... } }
```

### Step 2: 프로젝트 생성

```bash
# JWT 토큰을 환경변수로 저장
export TOKEN="eyJ..."

# 프로젝트 생성
curl -X POST http://localhost:3000/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Chat App",
    "slug": "my-chat-app"
  }'
# Response: { "id": "project-uuid", "name": "My Chat App", ... }
```

### Step 3: API Key 생성

```bash
export PROJECT_ID="project-uuid"

# API Key 생성 (scope: publish / read / admin)
curl -X POST http://localhost:3000/v1/projects/$PROJECT_ID/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "scope": "publish" }'
# Response: { "rawKey": "rh_abc123...", ... }
# ⚠️ rawKey는 이 시점에만 확인 가능. 반드시 복사해 저장하세요.
```

### Step 4: Consumer 등록

```bash
# WebSocket Consumer 등록
curl -X POST http://localhost:3000/v1/projects/$PROJECT_ID/consumers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mobile-app",
    "consumerType": "WEBSOCKET"
  }'

# Webhook Consumer 등록
curl -X POST http://localhost:3000/v1/projects/$PROJECT_ID/consumers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "partner-webhook",
    "consumerType": "WEBHOOK",
    "endpoint": "https://partner.example.com/webhook"
  }'
```

### Step 5: Subscription 생성

Consumer를 특정 이벤트 패턴에 구독시킵니다.

```bash
export CONSUMER_ID="consumer-uuid"

# chat.message.* 패턴의 모든 이벤트를 이 Consumer에게 배달
curl -X POST http://localhost:3000/v1/projects/$PROJECT_ID/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consumerId": "'$CONSUMER_ID'",
    "eventPattern": "chat.message.*"
  }'
```

### Step 6: 이벤트 발행

```bash
export API_KEY="rh_abc123..."

# 이벤트 발행 (API Key 인증)
curl -X POST http://localhost:3000/v1/projects/$PROJECT_ID/events \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "chat.message.created",
    "payload": {
      "messageId": "msg_001",
      "senderId": "user_123",
      "channelId": "general",
      "content": "Hello, world!",
      "timestamp": "2026-03-28T10:00:00Z"
    }
  }'
```

이 이벤트는 자동으로:
1. `event_ingest_logs` 테이블에 기록
2. Outbox Relay를 통해 NATS JetStream에 발행
3. `chat.message.*` 패턴을 구독한 Consumer들에게 배달
4. 배달 결과가 `delivery_logs`에 기록

### Step 7: WebSocket 실시간 수신

```javascript
// 클라이언트 (Socket.IO)
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/events');

// 인증
socket.emit('session.authenticate', {
  token: 'consumer-auth-token',
  projectId: 'project-uuid',
  consumerId: 'consumer-uuid'
});

// 이벤트 구독
socket.emit('subscription.attach', {
  type: 'topic',      // 'topic' | 'user' | 'channel'
  target: 'general'   // 토픽/유저/채널 이름
});

// 이벤트 수신
socket.on('event.delivered', (envelope) => {
  console.log('Received:', envelope.eventType, envelope.payload);

  // 수신 확인 (ACK)
  socket.emit('event.ack', { eventId: envelope.eventId });
});
```

### Step 8: 모니터링

**Dashboard에서:**

- **Overview** — 전체 이벤트, 배달률, 실패 건수, 활성 연결 수
- **Events** — 이벤트 수집 로그 (relayed / pending / failed)
- **Deliveries** — 채널별 배달 로그 (delivered / retrying / failed / dead_lettered)
- **Connections** — 활성 WebSocket 세션 목록

**API로:**

```bash
# 이벤트 수집 통계
curl http://localhost:3000/v1/projects/$PROJECT_ID/events/ingest-logs/stats \
  -H "Authorization: Bearer $TOKEN"

# 배달 통계
curl http://localhost:3000/v1/projects/$PROJECT_ID/delivery-logs/stats \
  -H "Authorization: Bearer $TOKEN"

# 활성 연결 수
curl http://localhost:3000/v1/projects/$PROJECT_ID/connections/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## API Reference

### Authentication

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/v1/auth/signup` | 회원가입 |
| POST | `/v1/auth/login` | 로그인 → JWT 발급 |
| GET | `/v1/auth/me` | 현재 사용자 정보 |

### Projects

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/v1/projects` | 프로젝트 생성 |
| GET | `/v1/projects` | 내 프로젝트 목록 |
| GET | `/v1/projects/:id` | 프로젝트 상세 |
| POST | `/v1/projects/:id/api-keys` | API Key 생성 |
| GET | `/v1/projects/:id/api-keys` | API Key 목록 |

### Events

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| POST | `/v1/projects/:id/events` | API Key | 이벤트 발행 |
| GET | `/v1/projects/:id/events/ingest-logs` | JWT | 수집 로그 조회 |
| GET | `/v1/projects/:id/events/ingest-logs/stats` | JWT | 수집 통계 |

### Consumers

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/v1/projects/:id/consumers` | Consumer 등록 |
| GET | `/v1/projects/:id/consumers` | Consumer 목록 |

### Subscriptions

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/v1/projects/:id/subscriptions` | 구독 생성 |
| GET | `/v1/projects/:id/subscriptions` | 구독 목록 |
| DELETE | `/v1/projects/:id/subscriptions/:subId` | 구독 비활성화 |

### Delivery & Connections

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/v1/projects/:id/delivery-logs` | 배달 로그 |
| GET | `/v1/projects/:id/delivery-logs/stats` | 배달 통계 |
| GET | `/v1/projects/:id/connections` | 활성 연결 목록 |
| GET | `/v1/projects/:id/connections/stats` | 연결 통계 |

### WebSocket Events (Socket.IO `/events` namespace)

| Event | Direction | 설명 |
|-------|-----------|------|
| `session.authenticate` | Client → Server | 세션 인증 |
| `subscription.attach` | Client → Server | 이벤트 룸 참가 |
| `subscription.detach` | Client → Server | 이벤트 룸 떠나기 |
| `event.delivered` | Server → Client | 이벤트 수신 |
| `event.ack` | Client → Server | 수신 확인 |

> Swagger UI: `http://localhost:3000/api/docs`

---

## Dashboard

관리 대시보드는 Next.js 16 + shadcn/ui로 구성되어 있으며 `http://localhost:3001`에서 접근합니다.

### 화면 구성

| 페이지 | 경로 | 기능 |
|--------|------|------|
| Login / Signup | `/auth/login`, `/auth/signup` | 인증 |
| Projects | `/projects` | 프로젝트 목록, 생성 |
| Overview | `/projects/:id` | 대시보드 메트릭 (이벤트, 배달률, 연결 수) |
| Events | `/projects/:id/events` | 이벤트 수집 로그 |
| Deliveries | `/projects/:id/deliveries` | 배달 로그 (All / Failed / Dead Letter 탭) |
| Connections | `/projects/:id/connections` | 활성 WebSocket 세션 |
| Consumers | `/projects/:id/consumers` | Consumer 등록/관리 |
| Subscriptions | `/projects/:id/subscriptions` | 구독 생성/비활성화 |
| Settings | `/projects/:id/settings` | API Key 생성/관리 |

---

## Project Structure

```
ProjectSignal/
├── docker-compose.yml              # PostgreSQL, Redis, NATS
├── docker/
│   ├── postgres/init.sql            # uuid-ossp 확장
│   └── nats/nats-server.conf       # JetStream 설정
│
├── src/                             # NestJS Backend
│   ├── main.ts                      # 앱 부트스트랩 (CORS, Swagger)
│   ├── app.module.ts                # 루트 모듈
│   │
│   ├── common/                      # 공통 레이어
│   │   ├── constants/               # DI 토큰 (EVENT_BUS, JOB_QUEUE 등)
│   │   ├── types/                   # EventEnvelope, DeliveryInput 등
│   │   ├── guards/                  # API Key Guard, WS Auth Guard
│   │   ├── pipes/                   # Zod Validation Pipe
│   │   └── exceptions/              # Global Exception Filter
│   │
│   ├── domain/                      # 도메인 레이어 (Hexagonal)
│   │   ├── entities/                # Project, Consumer, Subscription 등
│   │   └── ports/                   # 인바운드/아웃바운드 포트 인터페이스
│   │       ├── inbound/             # Use-case 인터페이스
│   │       └── outbound/            # 어댑터 인터페이스 + Repository 포트
│   │
│   ├── infrastructure/              # 인프라 레이어
│   │   ├── database/                # Drizzle ORM + Schema + Migration
│   │   ├── nats/                    # NATS EventBus 어댑터
│   │   ├── redis/                   # Redis Presence 어댑터
│   │   └── bullmq/                  # BullMQ JobQueue 어댑터
│   │
│   └── modules/                     # 기능 모듈
│       ├── auth/                    # JWT 인증 (signup, login, guard)
│       ├── projects/                # 프로젝트 + API Key 관리
│       ├── consumers/               # Consumer + Subscription 관리
│       ├── events/                  # 이벤트 수집, 라우팅, Outbox Relay
│       ├── delivery/                # 배달 오케스트레이션 + 전략 패턴
│       ├── realtime/                # Socket.IO Gateway + Presence
│       └── async-delivery/          # BullMQ 비동기 배달 프로세서
│
└── dashboard/                       # Next.js Dashboard
    └── src/
        ├── app/                     # App Router 페이지
        ├── components/              # UI 컴포넌트 (shadcn/ui)
        ├── contexts/                # Auth Context
        └── lib/                     # API 클라이언트
```

### Architecture: Hexagonal (Ports & Adapters)

```
┌─────────────────────────────────────────────────────┐
│                   Application                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Domain Layer                        │ │
│  │  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │ │
│  │  │ Entities │  │  Ports   │  │  Use Cases    │  │ │
│  │  │          │  │ (Inbound │  │ (Interfaces)  │  │ │
│  │  │          │  │  & Out-  │  │               │  │ │
│  │  │          │  │  bound)  │  │               │  │ │
│  │  └─────────┘  └──────────┘  └───────────────┘  │ │
│  └──────────────────────┬──────────────────────────┘ │
│                         │ implements                  │
│  ┌──────────────────────┴──────────────────────────┐ │
│  │          Infrastructure (Adapters)               │ │
│  │  ┌──────┐ ┌───────┐ ┌───────┐ ┌──────────────┐ │ │
│  │  │ NATS │ │ Redis │ │BullMQ │ │  PostgreSQL   │ │ │
│  │  │Event │ │Presenc│ │ Job   │ │  (Drizzle)   │ │ │
│  │  │ Bus  │ │e Store│ │ Queue │ │  Repository  │ │ │
│  │  └──────┘ └───────┘ └───────┘ └──────────────┘ │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Scripts

```bash
# Backend
npm run start:dev          # 개발 서버 (hot reload)
npm run build              # 프로덕션 빌드
npm run start:prod         # 프로덕션 실행
npm run db:generate        # Drizzle 마이그레이션 생성
npm run db:migrate         # 마이그레이션 실행

# Dashboard
cd dashboard
npm run dev                # 개발 서버 (port 3001)
npm run build              # 프로덕션 빌드

# Infrastructure
docker compose up -d       # PostgreSQL, Redis, NATS 실행
docker compose down        # 중지
docker compose logs -f     # 로그 확인
```

---

## License

MIT
