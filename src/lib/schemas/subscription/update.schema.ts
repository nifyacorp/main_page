import { z } from 'zod';
import { BaseSubscriptionSchema, PromptsSchema } from './base.schema';

// Schema for updating a subscription
export const UpdateSubscriptionSchema = BaseSubscriptionSchema
  .partial() // All fields are optional for updates
  .extend({
    prompts: PromptsSchema.optional(),
    active: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
  });
export type UpdateSubscription = z.infer<typeof UpdateSubscriptionSchema>;

// Request schema
export const UpdateSubscriptionRequestSchema = UpdateSubscriptionSchema;
export type UpdateSubscriptionRequest = z.infer<typeof UpdateSubscriptionRequestSchema>; 