import { z } from 'zod';

export const PublishEventSchema = z.object({
  eventType: z.string().min(1).max(255),
  producer: z.string().min(1).max(255),
  deliverAt: z.string().datetime().optional(),
  ttlSeconds: z.number().int().positive().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  routing: z.object({
    users: z.array(z.string()).optional(),
    topics: z.array(z.string()).optional(),
    channels: z.array(z.string()).optional(),
  }),
  payload: z.record(z.unknown()),
  idempotencyKey: z.string().max(255).optional(),
});

export type PublishEventDto = z.infer<typeof PublishEventSchema>;
