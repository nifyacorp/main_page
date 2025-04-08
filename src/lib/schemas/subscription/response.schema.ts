import { z } from 'zod';
import { BaseSubscriptionSchema, PromptsSchema } from './base.schema';

// Schema for subscription data in responses
export const SubscriptionResponseSchema = BaseSubscriptionSchema.extend({
  id: z.string().uuid('Invalid subscription ID format'),
  prompts: PromptsSchema,
  active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  userId: z.string().uuid('Invalid user ID format'),
});
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;

// List response
export const SubscriptionListResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    subscriptions: z.array(SubscriptionResponseSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }).optional(),
  }),
});
export type SubscriptionListResponse = z.infer<typeof SubscriptionListResponseSchema>;

// Get single subscription response
export const SubscriptionGetResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    subscription: SubscriptionResponseSchema,
  }),
});
export type SubscriptionGetResponse = z.infer<typeof SubscriptionGetResponseSchema>;

// Create/Update subscription response
export const SubscriptionCreateUpdateResponseSchema = SubscriptionGetResponseSchema;
export type SubscriptionCreateUpdateResponse = z.infer<typeof SubscriptionCreateUpdateResponseSchema>;

// Delete subscription response
export const SubscriptionDeleteResponseSchema = z.object({
  status: z.literal('success'),
  message: z.string(),
  details: z.object({
    id: z.string().uuid(),
    alreadyRemoved: z.boolean().optional(),
  }),
});
export type SubscriptionDeleteResponse = z.infer<typeof SubscriptionDeleteResponseSchema>; 