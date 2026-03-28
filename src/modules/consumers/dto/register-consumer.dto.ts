import { z } from 'zod';

export const RegisterConsumerSchema = z.object({
  name: z.string().min(1).max(255),
  consumerType: z.enum(['WEBSOCKET', 'WEBHOOK', 'PUSH', 'EMAIL']),
  endpoint: z.string().max(2048).optional(),
  authConfigJson: z.record(z.unknown()).optional(),
});

export type RegisterConsumerDto = z.infer<typeof RegisterConsumerSchema>;
