import { z } from 'zod';

export const WsAuthenticateSchema = z.object({
  token: z.string().min(1),
  projectId: z.string().uuid(),
  consumerId: z.string().uuid(),
});

export type WsAuthenticateDto = z.infer<typeof WsAuthenticateSchema>;
