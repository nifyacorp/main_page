import { useState, useCallback } from 'react';
import { authService, EmailPreferences } from '../api';

interface UpdateEmailPreferenceParams {
  email_notifications?: boolean;
  notification_email?: string | null;
  digest_time?: string;
}

interface UpdateEmailPreferenceResponse {
  message: string;
  preferences: EmailPreferences;
}

export function useEmailPreferences() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get email preferences (memoized to prevent infinite loops)
  const getEmailPreferences = useCallback(async (): Promise<EmailPreferences> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await authService.getEmailPreferences();
      
      if (apiError) {
        throw new Error(apiError);
      }
      
      return data as EmailPreferences;
    } catch (err) {
      console.error('Failed to fetch email preferences', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch email preferences'));
      
      // Return default preferences on error
      return {
        email_notifications: false,
        notification_email: null,
        digest_time: '08:00:00'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update email preferences (memoized to prevent infinite loops)
  const updateEmailPreferences = useCallback(async (
    data: UpdateEmailPreferenceParams
  ): Promise<UpdateEmailPreferenceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: responseData, error: apiError } = await authService.updateEmailPreferences(data);
      
      if (apiError) {
        throw new Error(apiError);
      }
      
      return responseData as UpdateEmailPreferenceResponse;
    } catch (err) {
      console.error('Failed to update email preferences', err);
      setError(err instanceof Error ? err : new Error('Failed to update email preferences'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send test email (memoized to prevent infinite loops)
  const sendTestEmail = useCallback(async (): Promise<{ message: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: responseData, error: apiError } = await authService.sendTestEmail();
      
      if (apiError) {
        throw new Error(apiError);
      }
      
      return responseData as { message: string };
    } catch (err) {
      console.error('Failed to send test email', err);
      setError(err instanceof Error ? err : new Error('Failed to send test email'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getEmailPreferences,
    updateEmailPreferences,
    sendTestEmail,
    isLoading,
    error
  };
}