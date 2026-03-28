import { z } from 'zod';

export const WsSubscribeSchema = z.object({
  type: z.enum(['topic', 'user', 'channel']),
  target: z.string().min(1),
});

export type WsSubscribeDto = z.infer<typeof WsSubscribeSchema>;
