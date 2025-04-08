import { z } from 'zod';
import { BaseSubscriptionSchema, PromptsSchema } from './base.schema';

// Schema for creating a subscription
export const CreateSubscriptionSchema = BaseSubscriptionSchema.extend({
  prompts: PromptsSchema,
  metadata: z.record(z.any()).optional(),
});
export type CreateSubscription = z.infer<typeof CreateSubscriptionSchema>;

// Request schema
export const CreateSubscriptionRequestSchema = CreateSubscriptionSchema;
export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionRequestSchema>; 