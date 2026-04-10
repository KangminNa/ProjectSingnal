import { z } from 'zod';

export const CreateSubscriptionSchema = z.object({
  consumerId: z.string().uuid(),
  eventPattern: z.string().min(1).max(500),
  routingFilterJson: z.record(z.unknown()).optional(),
  policyId: z.string().uuid().optional(),
});

export type CreateSubscriptionDto = z.infer<typeof CreateSubscriptionSchema>;
