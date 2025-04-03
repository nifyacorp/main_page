import { useState } from 'react';
import { backendClientWithMethods as API } from '@/lib/api/clients/backend';
import { useAuth } from '@/contexts/AuthContext';

interface EmailPreference {
  email_notifications: boolean;
  notification_email: string | null;
  digest_time: string;
}

interface UpdateEmailPreferenceParams {
  email_notifications?: boolean;
  notification_email?: string | null;
  digest_time?: string;
}

interface UpdateEmailPreferenceResponse {
  message: string;
  preferences: EmailPreference;
}

export function useEmailPreferences() {
  const { authHeaders } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get email preferences
  const getEmailPreferences = async (): Promise<EmailPreference> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await API.get('/v1/me/email-preferences', { headers: authHeaders() });
      
      return response.data;
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
  };

  // Update email preferences
  const updateEmailPreferences = async (
    data: UpdateEmailPreferenceParams
  ): Promise<UpdateEmailPreferenceResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await API.patch(
        '/v1/me/email-preferences',
        data,
        { headers: authHeaders() }
      );
      
      return response.data;
    } catch (err) {
      console.error('Failed to update email preferences', err);
      setError(err instanceof Error ? err : new Error('Failed to update email preferences'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Send test email
  const sendTestEmail = async (email: string): Promise<{ message: string; email: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await API.post(
        '/v1/me/test-email',
        { email },
        { headers: authHeaders() }
      );
      
      return response.data;
    } catch (err) {
      console.error('Failed to send test email', err);
      setError(err instanceof Error ? err : new Error('Failed to send test email'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getEmailPreferences,
    updateEmailPreferences,
    sendTestEmail,
    isLoading,
    error
  };
}