import { z } from 'zod';

// Base schemas for reusable validation

export const UuidSchema = z.string().uuid({
  message: 'Invalid UUID format'
});

export const EmailSchema = z.string().email({
  message: 'Invalid email address format'
});

export const SubscriptionFrequencySchema = z.enum(['immediate', 'daily'], {
  errorMap: () => ({ message: 'Frequency must be either "immediate" or "daily"' })
});

export const SubscriptionTypeSchema = z.enum(['boe', 'real-estate', 'custom'], {
  errorMap: () => ({ message: 'Type must be one of: boe, real-estate, custom' })
});

// Subscription schemas

export const CreateSubscriptionSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters long' }).max(100),
  description: z.string().max(500).optional(),
  type: SubscriptionTypeSchema,
  typeId: z.string().optional(),
  prompts: z.array(z.string()).min(1, { message: 'At least one prompt is required' }).max(3, { message: 'Maximum 3 prompts allowed' }),
  logo: z.string().url({ message: 'Logo must be a valid URL' }).optional(),
  frequency: SubscriptionFrequencySchema
});

export const UpdateSubscriptionSchema = CreateSubscriptionSchema.partial();

export const ToggleSubscriptionSchema = z.object({
  active: z.boolean({
    required_error: 'Active status is required',
    invalid_type_error: 'Active status must be a boolean'
  })
});

// User schemas

export const UpdateUserProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['es', 'en', 'ca']).optional()
});

export const UpdateNotificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  notificationEmail: z.string().email().nullable().optional(),
  emailFrequency: z.enum(['daily']).optional(),
  instantNotifications: z.boolean().optional()
});

// Notification schemas

export const MarkNotificationReadSchema = z.object({
  id: UuidSchema
});

// Response type generators for better TypeScript integration
export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionSchema>;
export type UpdateSubscriptionRequest = z.infer<typeof UpdateSubscriptionSchema>;
export type UpdateUserProfileRequest = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateNotificationSettingsRequest = z.infer<typeof UpdateNotificationSettingsSchema>;