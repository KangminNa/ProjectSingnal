import { EventEnvelope } from '@common/types/event-envelope';

export function createTestEvent(overrides: Partial<EventEnvelope> = {}): EventEnvelope {
  return {
    eventId: 'evt_test_001',
    projectId: 'proj_test_001',
    eventType: 'chat.message.created',
    producer: 'test-service',
    occurredAt: new Date(),
    deliverAt: null,
    ttlSeconds: 86400,
    priority: 'normal',
    routing: {
      users: ['user_001'],
      topics: ['room:test'],
    },
    payload: {
      messageId: 'msg_001',
      preview: 'Hello, world!',
    },
    metadata: {
      traceId: 'tr_test_001',
      idempotencyKey: 'ik_test_001',
    },
    ...overrides,
  };
}
