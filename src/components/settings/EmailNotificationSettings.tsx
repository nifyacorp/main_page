import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useEmailPreferences } from '@/hooks/use-email-preferences';
import { useAuth } from '@/contexts/AuthContext';

interface EmailPreference {
  email_notifications: boolean;
  notification_email: string | null;
  digest_time: string;
}

const DEFAULT_PREFERENCES: EmailPreference = {
  email_notifications: false,
  notification_email: null,
  digest_time: '08:00:00'
};

// Map database time format (HH:MM:SS) to display format (HH:MM AM/PM)
const formatTimeForDisplay = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const hoursNum = parseInt(hours, 10);
    const isPM = hoursNum >= 12;
    const displayHours = hoursNum % 12 || 12;
    return `${displayHours}:${minutes} ${isPM ? 'PM' : 'AM'}`;
  } catch (error) {
    return '8:00 AM';
  }
};

// Map display time format to database format
const formatTimeForDatabase = (time: string): string => {
  try {
    const [timePart, ampm] = time.split(' ');
    const [hours, minutes] = timePart.split(':');
    let hoursNum = parseInt(hours, 10);
    
    if (ampm === 'PM' && hoursNum < 12) {
      hoursNum += 12;
    } else if (ampm === 'AM' && hoursNum === 12) {
      hoursNum = 0;
    }
    
    return `${hoursNum.toString().padStart(2, '0')}:${minutes}:00`;
  } catch (error) {
    return '08:00:00';
  }
};

export function EmailNotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [customEmail, setCustomEmail] = useState(false);
  const [preferences, setPreferences] = useState<EmailPreference>(DEFAULT_PREFERENCES);
  const { 
    getEmailPreferences, 
    updateEmailPreferences,
    sendTestEmail, 
    isLoading,
    error 
  } = useEmailPreferences();

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await getEmailPreferences();
        setPreferences(data);
        setCustomEmail(!!data.notification_email);
      } catch (err) {
        console.error('Failed to load email preferences', err);
      }
    };
    
    loadPreferences();
  }, [getEmailPreferences]);

  // Handle toggle for email notifications
  const handleToggleEmailNotifications = async (checked: boolean) => {
    try {
      const updated = await updateEmailPreferences({ email_notifications: checked });
      setPreferences(updated.preferences);
      
      toast({
        title: 'Email notifications updated',
        description: checked ? 'You will now receive email notifications' : 'Email notifications have been disabled',
        duration: 3000
      });
    } catch (err) {
      toast({
        title: 'Failed to update preferences',
        description: 'Please try again later',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  // Handle toggle for custom email
  const handleToggleCustomEmail = (checked: boolean) => {
    setCustomEmail(checked);
    
    if (!checked) {
      // Reset notification email when turning off custom email
      handleUpdateNotificationEmail(null);
    }
  };

  // Handle update notification email
  const handleUpdateNotificationEmail = async (email: string | null) => {
    try {
      const updated = await updateEmailPreferences({ notification_email: email });
      setPreferences(updated.preferences);
      
      toast({
        title: 'Email updated',
        description: 'Your notification email has been updated',
        duration: 3000
      });
    } catch (err) {
      toast({
        title: 'Failed to update email',
        description: 'Please try again later',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  // Handle digest time change
  const handleDigestTimeChange = async (value: string) => {
    try {
      const timeForDB = formatTimeForDatabase(value);
      const updated = await updateEmailPreferences({ digest_time: timeForDB });
      setPreferences(updated.preferences);
      
      toast({
        title: 'Digest time updated',
        description: `You will now receive daily digests at ${value}`,
        duration: 3000
      });
    } catch (err) {
      toast({
        title: 'Failed to update digest time',
        description: 'Please try again later',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  // Handle sending test email
  const handleSendTestEmail = async () => {
    try {
      setSendingTest(true);
      const email = preferences.notification_email || user?.email || '';
      
      if (!email) {
        toast({
          title: 'No email available',
          description: 'Please set a notification email first',
          variant: 'destructive',
          duration: 5000
        });
        return;
      }
      
      await sendTestEmail(email);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      toast({
        title: 'Test email sent',
        description: `A test email has been sent to ${email}`,
        duration: 3000
      });
    } catch (err) {
      toast({
        title: 'Failed to send test email',
        description: 'Please try again later',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Format the time for the select component
  const digestTimeOptions = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', 
    '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'
  ];
  
  const currentTimeForSelect = formatTimeForDisplay(preferences.digest_time);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" /> Email Notifications
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications via email
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message || 'Failed to load email preferences'}
            </AlertDescription>
          </Alert>
        )}
        
        {showSuccess && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Test Email Sent</AlertTitle>
            <AlertDescription>
              A test email has been sent to your inbox. It might take a few minutes to arrive.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-notifications" className="text-base">Enable Email Notifications</Label>
            <p className="text-sm text-gray-500">
              Receive daily digests of your notifications via email
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences.email_notifications}
            onCheckedChange={handleToggleEmailNotifications}
            disabled={isLoading}
          />
        </div>
        
        {preferences.email_notifications && (
          <>
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="custom-email" className="text-base">Use Custom Email</Label>
                  <p className="text-sm text-gray-500">
                    Send notifications to a different email address
                  </p>
                </div>
                <Switch
                  id="custom-email"
                  checked={customEmail}
                  onCheckedChange={handleToggleCustomEmail}
                  disabled={isLoading}
                />
              </div>
              
              {customEmail && (
                <div className="space-y-2">
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input
                    id="notification-email"
                    type="email"
                    placeholder="your-email@example.com"
                    value={preferences.notification_email || ''}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notification_email: e.target.value
                    })}
                    onBlur={(e) => handleUpdateNotificationEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="digest-time" className="text-base">Daily Digest Time</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Choose when to receive your daily notification summary
                </p>
                <Select
                  value={currentTimeForSelect}
                  onValueChange={handleDigestTimeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="digest-time" className="w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {digestTimeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-1">
                  All times are in your local timezone
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">
          You can update your preferences anytime
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSendTestEmail}
          disabled={sendingTest || isLoading || !preferences.email_notifications}
        >
          {sendingTest ? 'Sending...' : 'Send Test Email'}
        </Button>
      </CardFooter>
    </Card>
  );
}