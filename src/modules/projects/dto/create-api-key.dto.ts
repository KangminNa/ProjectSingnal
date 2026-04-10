import { z } from 'zod';

export const CreateApiKeySchema = z.object({
  scope: z.enum(['publish', 'admin', 'read']),
});

export type CreateApiKeyDto = z.infer<typeof CreateApiKeySchema>;
