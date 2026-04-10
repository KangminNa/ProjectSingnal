# ProjectSignal

**Multi-tenant Event Delivery Infrastructure** — 외부 서비스가 회원가입 후 IP:PORT와 이벤트 규칙만 등록하면, 알림/메신저/웹훅 배달을 자동으로 처리하는 이벤트 딜리버리 플랫폼.

> 채팅, 알림, 웹훅, 이메일, 푸시 — 어떤 채널이든 하나의 이벤트로 시작됩니다.

---

## Table of Contents

- [What is ProjectSignal?](#what-is-projectsignal)
- [How It Works](#how-it-works)
- [Why ProjectSignal?](#why-projectsignal)
- [Comparison with Other Tools](#comparison-with-other-tools)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Dashboard](#dashboard)
- [Project Structure](#project-structure)

---

## What is ProjectSignal?

ProjectSignal은 **이벤트 기반의 멀티테넌트 메시지 딜리버리 플랫폼**입니다.

외부 서비스가 자체적으로 복잡한 메시징 인프라를 구축하지 않고도, ProjectSignal에 **서버 엔드포인트(IP:PORT)와 이벤트 규칙만 등록**하면 알림, 채팅, 웹훅 배달을 자동으로 처리합니다.

```
┌──────────────┐     "이 메시지를, 이 시간에, 이 대상에게 보내줘"
│ 쇼핑몰 서버   │ ─────────────────────────────────────────────►┌────────────────┐
└──────────────┘                                                │                │
┌──────────────┐     "이 알림을, 지금 바로, 전체 채널에 보내줘"   │ ProjectSignal  │ ──► WebSocket
│ 채팅 서버     │ ─────────────────────────────────────────────►│                │ ──► Webhook
└──────────────┘                                                │  (배달 대행)    │ ──► Push
┌──────────────┐     "이 이메일을, 1시간 뒤에, 이 그룹에 보내줘" │                │ ──► Email
│ 마케팅 서버   │ ─────────────────────────────────────────────►│                │
└──────────────┘                                                └────────────────┘
```

### Core Concepts

| 개념 | 설명 |
|------|------|
| **Project** | 멀티테넌트 격리 단위. 각 프로젝트는 독립된 이벤트 스트림과 설정을 가짐 |
| **Consumer (Endpoint)** | 이벤트를 수신하는 대상. 사용자가 자신의 서버 IP:PORT를 등록 |
| **Subscription** | Consumer가 특정 이벤트 패턴(`chat.message.*`)을 구독하는 규칙 |
| **EventEnvelope** | 이벤트 메타데이터 + 페이로드를 담는 표준 포맷 |
| **Delivery Log** | 모든 배달 이력을 추적하는 감사 로그 |

---

## How It Works

```
1. 회원가입 + 프로젝트 생성
2. API Key 발급
3. Consumer(엔드포인트) 등록 — "내 서버는 http://my-server:8080/webhook 이야"
4. Subscription 생성 — "chat.message.* 이벤트를 Webhook으로 받고 싶어"
5. 이벤트 발행 — POST /v1/projects/:id/events
6. ProjectSignal이 자동으로 매칭 + 배달 + 로그 기록
```

**ProjectSignal은 메시지 내용을 해석하지 않습니다.** 언제/누구에게/어떤 채널로 전달할지만 처리하는 **배달 인프라**입니다.

---

## Why ProjectSignal?

기존 도구들은 각각의 영역에서 뛰어나지만, **이벤트 수집 → 라우팅 → 멀티채널 배달 → 모니터링**을 하나의 시스템에서 제공하는 도구는 거의 없습니다.

| 문제 | 설명 |
|------|------|
| **알림 플랫폼은 Webhook을 못 한다** | Novu, Knock 등은 사용자 알림에 특화. 시스템 간 Webhook 배달 미지원 |
| **Webhook 서비스는 실시간을 못 한다** | Svix, Hookdeck은 HTTP Callback에 특화. WebSocket 미지원 |
| **실시간 서버는 오프라인 배달을 못 한다** | Centrifugo, Socket.IO는 연결된 클라이언트에게만 전달 |
| **이벤트 스트리밍은 배달 로직이 없다** | Kafka, NATS 자체는 메시지 브로커. 배달 오케스트레이션은 직접 구현 |

### ProjectSignal이 해결하는 것

```
"하나의 이벤트" → "적절한 채널로" → "확실하게 배달" → "실패하면 재시도" → "모니터링"
```

- 이벤트 하나를 발행하면, 구독 규칙에 따라 WebSocket + Webhook + Push를 동시에 처리
- Outbox Pattern으로 이벤트 유실 방지
- 모든 배달 이력을 로그로 추적 (Delivery Log)
- 프로젝트별 격리된 멀티테넌트 관리

---

## Comparison with Other Tools

| 기능 | ProjectSignal | Novu | Svix | Centrifugo | Kafka |
|------|:---:|:---:|:---:|:---:|:---:|
| 셀프호스팅 | O | O | O | O | O |
| 실시간 (WebSocket) | O | In-App만 | X | O | X |
| Webhook 배달 | O | X | O | X | 직접 구현 |
| Push/Email | O | O | X | X | 직접 구현 |
| 멀티채널 라우팅 | O | O | X | X | X |
| 이벤트 수집 + 라우팅 | O | X | X | X | O |
| 재시도 / DLQ | O | O | O | X | 직접 구현 |
| Outbox Pattern | O | X | X | X | X |
| 멀티테넌트 | O | O | O | 부분적 | 부분적 |
| 대시보드 | O | O | O | 관리 UI | X |
| 구독 패턴 매칭 | O | X | X | 채널 기반 | 토픽 기반 |

---

## Architecture

### Design Patterns

| 패턴 | 위치 | 역할 |
|------|------|------|
| **Core Declarations** | `core/*.d.ts` | 시스템 전체 계약을 .d.ts로 한눈에 파악 |
| **BaseRepository** | `core/base.repository.ts` | Repository CRUD 보일러플레이트 제거 |
| **Strategy + Registry** | `infrastructure/transport/` + `modules/delivery/transport.registry.ts` | 프로토콜별 분기 (HTTP / WebSocket 2개) |
| **CQRS** | 모든 `modules/*/` | Command(상태변경) / Query(읽기전용) 서비스 분리 |
| **Pipeline** | `modules/events/` → `modules/delivery/` | Ingest → Route → Dispatch → Transport → Log |
| **Outbox** | `modules/events/outbox-relay.service.ts` | DB 저장 후 비동기 Relay로 이벤트 유실 방지 |

### Dependency Flow

```
modules/ → core/ ← infrastructure/
             ↑
          common/
```

- `modules/` — 자기완결형 기능 단위 (controller + service + repository + dto)
- `core/` — .d.ts 선언 + BaseRepository + DI 토큰 (런타임 코드 최소)
- `infrastructure/` — 외부 시스템 어댑터 (core 계약을 구현)
- `common/` — 순수 유틸리티

### Event Pipeline

```
Publisher → [Ingest] → [Route] → [NATS] → [Dispatch] → [Transport] → [Log]
               │          │                    │             │           │
            DB 저장    브로커발행            구독매칭     프로토콜전달   결과기록
```

---

## Tech Stack

| 레이어 | 기술 | 역할 |
|--------|------|------|
| **Backend** | NestJS 11 + TypeScript | API 서버, DI 컨테이너 |
| **Database** | PostgreSQL 16 + Drizzle ORM | 영구 저장소 |
| **Message Broker** | NATS 2.10 | 이벤트 발행/구독 백본 |
| **Cache / Presence** | Redis 7 (ioredis) | 세션 상태, 온라인 추적 |
| **Job Queue** | BullMQ 5 | 비동기 배달, 재시도 |
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

### 1. Clone & Install

```bash
git clone https://github.com/KangminNa/ProjectSingnal.git
cd ProjectSignal

npm install
cd dashboard && npm install && cd ..
```

### 2. Environment Setup

```bash
cp .env.example .env
```

### 3. Start Infrastructure

```bash
docker compose up -d
```

| 서비스 | 포트 | 용도 |
|--------|------|------|
| PostgreSQL | 5432 | 데이터베이스 |
| Redis | 6379 | 캐시 / Presence |
| NATS | 4222 | 메시지 브로커 |

### 4. Database Migration

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start

```bash
# Backend (port 3000)
npm run start:dev

# Dashboard (port 3001)
cd dashboard && npm run dev
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- Dashboard: http://localhost:3001

---

## Usage Guide

### Quick Start (5단계)

```bash
# 1. 회원가입
curl -X POST http://localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123","name":"Admin"}'

# 2. 프로젝트 생성 (TOKEN은 회원가입 응답의 accessToken)
curl -X POST http://localhost:3000/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My App","slug":"my-app"}'

# 3. Consumer(엔드포인트) 등록
curl -X POST http://localhost:3000/v1/projects/$PROJECT_ID/consumers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Webhook","consumerType":"WEBHOOK","endpoint":"http://my-server:8080/webhook"}'

# 4. Subscription 생성
curl -X POST http://localhost:3000/v1/projects/$PROJECT_ID/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"consumerId":"'$CONSUMER_ID'","eventPattern":"chat.message.*"}'

# 5. 이벤트 발행 → 자동으로 Webhook 배달!
curl -X POST http://localhost:3000/v1/projects/$PROJECT_ID/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType":"chat.message.created",
    "producer":"chat-service",
    "priority":"normal",
    "routing":{},
    "payload":{"text":"Hello!","sender":"kangmin"}
  }'
```

### WebSocket 실시간 수신

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/events');

socket.emit('session.authenticate', {
  token: 'jwt-token',
  projectId: 'project-uuid',
  consumerId: 'consumer-uuid'
});

socket.emit('subscription.attach', { type: 'topic', target: 'general' });

socket.on('event.delivered', (envelope) => {
  console.log('Received:', envelope.eventType, envelope.payload);
  socket.emit('event.ack', { eventId: envelope.eventId });
});
```

---

## API Reference

### Authentication

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/v1/auth/signup` | 회원가입 |
| POST | `/v1/auth/login` | 로그인 → JWT 발급 |
| GET | `/v1/auth/me` | 현재 사용자 정보 |

### Projects & API Keys

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/v1/projects` | 프로젝트 생성 |
| GET | `/v1/projects` | 내 프로젝트 목록 |
| GET | `/v1/projects/:id` | 프로젝트 상세 |
| POST | `/v1/projects/:id/api-keys` | API Key 생성 |
| GET | `/v1/projects/:id/api-keys` | API Key 목록 |

### Events

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/v1/projects/:id/events` | 이벤트 발행 |
| GET | `/v1/projects/:id/events/ingest-logs` | 수집 로그 |
| GET | `/v1/projects/:id/events/ingest-logs/stats` | 수집 통계 |

### Consumers & Subscriptions

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/v1/projects/:id/consumers` | Consumer 등록 |
| GET | `/v1/projects/:id/consumers` | Consumer 목록 |
| POST | `/v1/projects/:id/subscriptions` | 구독 생성 |
| GET | `/v1/projects/:id/subscriptions` | 구독 목록 |
| DELETE | `/v1/projects/:id/subscriptions/:subId` | 구독 비활성화 |

### Delivery & Connections

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/v1/projects/:id/delivery-logs` | 배달 로그 |
| GET | `/v1/projects/:id/delivery-logs/stats` | 배달 통계 |
| GET | `/v1/projects/:id/connections` | 활성 연결 |
| GET | `/v1/projects/:id/connections/stats` | 연결 통계 |

### WebSocket (Socket.IO `/events`)

| Event | 방향 | 설명 |
|-------|------|------|
| `session.authenticate` | Client → Server | 세션 인증 |
| `subscription.attach` | Client → Server | 룸 참가 |
| `subscription.detach` | Client → Server | 룸 이탈 |
| `event.delivered` | Server → Client | 이벤트 수신 |
| `event.ack` | Client → Server | 수신 확인 |

> Swagger UI: http://localhost:3000/api/docs

---

## Dashboard

관리 대시보드는 http://localhost:3001 에서 접근합니다.

| 페이지 | 경로 | 기능 |
|--------|------|------|
| **Overview** | `/projects/:id` | 온보딩 가이드 + 메트릭 대시보드 |
| **Integration** | `/projects/:id/integration` | API Key 관리 + cURL/Node.js/Python 코드 예시 |
| **Endpoints** | `/projects/:id/endpoints` | Consumer + Subscription 통합 관리 |
| **Playground** | `/projects/:id/playground` | 이벤트 발행 테스트 + 실시간 배달 결과 |
| **Events** | `/projects/:id/events` | 이벤트 수집 로그 (필터링, 페이지네이션, 자동 새로고침) |
| **Deliveries** | `/projects/:id/deliveries` | 배달 로그 (상태/채널 필터, 페이지네이션) |
| **Connections** | `/projects/:id/connections` | 활성 WebSocket 세션 |

---

## Project Structure

```
src/
├── core/                              ① 시스템 계약 (.d.ts) + 추상 클래스
│   ├── entities.d.ts                    모든 Entity 인터페이스
│   ├── transport.d.ts                   TransportAdapter, Request, Response
│   ├── event-bus.d.ts                   EventBus, PresenceStore, JobQueue
│   ├── repository.d.ts                  모든 Repository 인터페이스
│   ├── enums.ts                         ConsumerType, TransportProtocol (런타임)
│   ├── base.repository.ts              BaseRepository<T> 추상 클래스
│   └── injection-tokens.ts             DI 토큰
│
├── modules/                           ② 자기완결형 기능 모듈
│   ├── auth/                            controller + service + repo + dto
│   ├── projects/                        controller + service + repo + dto
│   ├── consumers/                       controller + service + repo + dto
│   ├── events/                          Ingest → Route → Dispatch → Outbox
│   └── delivery/                        Orchestrator + Registry + Processors
│
├── infrastructure/                    ③ 외부 시스템 어댑터 (슬림)
│   ├── persistence/                     Drizzle provider + schema 정의만
│   ├── messaging/                       NATS EventBus 어댑터
│   ├── cache/                           Redis Presence 어댑터
│   ├── queue/                           BullMQ JobQueue 어댑터
│   └── transport/                       배달 프로토콜 (2개만)
│       ├── http/                          HTTP POST (webhook, push, email 통합)
│       └── socketio/                      WebSocket (Gateway + Session)
│
├── api/                               ④ HTTP 진입점 보호
│   ├── guards/                          JWT, API Key, WS Auth
│   ├── decorators/                      CurrentUser, ProjectId
│   ├── interceptors/                    Logging, Tracing
│   └── zod-validation.pipe.ts           요청 검증
│
├── common/                            ⑤ 순수 유틸
│   ├── utils/                           패턴매칭, 룸네임, 채널매퍼
│   └── exceptions/                      도메인 예외, 글로벌 필터
│
└── config/                            ⑥ 환경 설정

dashboard/                             Next.js 16 관리 대시보드
├── src/app/                             App Router 페이지
├── src/components/                      UI 컴포넌트 (shadcn/ui)
├── src/contexts/                        Auth Context
└── src/lib/                             API 클라이언트
```

### 새 모듈 추가하기

```bash
# 1. 모듈 디렉토리 생성
mkdir -p src/modules/notifications/dto

# 2. 필요한 파일 작성
#    - notifications.module.ts
#    - notifications.controller.ts
#    - notifications-command.service.ts
#    - notification.repository.ts  ← extends BaseRepository<T>
#    - dto/create-notification.dto.ts

# 3. app.module.ts에 import 한 줄 추가
```

---

## Scripts

```bash
# Backend
npm run start:dev          # 개발 서버 (hot reload)
npm run start:debug        # 디버그 모드
npm run build              # 프로덕션 빌드
npm run db:generate        # 마이그레이션 생성
npm run db:migrate         # 마이그레이션 실행

# Dashboard
cd dashboard
npm run dev                # 개발 서버 (port 3001)
npm run build              # 프로덕션 빌드

# Infrastructure
docker compose up -d       # PostgreSQL, Redis, NATS
docker compose down -v     # 중지 + 데이터 초기화
```

---

## License

MIT
