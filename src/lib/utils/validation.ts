import { z } from 'zod';

/**
 * Validate data against a Zod schema
 * Returns an object with `success`, `data` and `error` properties
 */
export function validateWithZod<T>(schema: z.ZodType<T>, data: unknown) {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>);
      
      return { 
        success: false, 
        data: null as unknown as T, 
        error: {
          message: 'Validation failed',
          details: formattedErrors
        }
      };
    }
    
    return { 
      success: false, 
      data: null as unknown as T, 
      error: {
        message: 'Validation error',
        details: { _error: 'Unknown validation error' }
      }
    };
  }
}

/**
 * Creates a typed validator function for a specific schema
 */
export function createValidator<T>(schema: z.ZodType<T>) {
  return (data: unknown) => validateWithZod<T>(schema, data);
}