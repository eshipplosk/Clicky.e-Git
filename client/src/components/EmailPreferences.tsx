/**
 * EmailPreferences Component
 * 
 * Allows students to manage their email notification preferences.
 * Settings include:
 * - Master toggle for all email notifications
 * - Application status updates (submitted, approved, rejected)
 * - Deadline reminders for pending documents/actions
 * - Weekly digest of all application statuses
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Mail, Bell, Calendar, FileText, Loader2 } from 'lucide-react';
import type { StudentProfile } from '@shared/schema';

interface EmailPreferencesProps {
  variant?: 'card' | 'inline';
}

export function EmailPreferences({ variant = 'card' }: EmailPreferencesProps) {
  const { toast } = useToast();
  
  const { data: profile, isLoading } = useQuery<StudentProfile>({
    queryKey: ['/api/profile'],
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    emailApplicationUpdates: true,
    emailDeadlineReminders: true,
    emailWeeklyDigest: true,
  });

  useEffect(() => {
    if (profile) {
      setPreferences({
        emailNotifications: profile.emailNotifications ?? true,
        emailApplicationUpdates: profile.emailApplicationUpdates ?? true,
        emailDeadlineReminders: profile.emailDeadlineReminders ?? true,
        emailWeeklyDigest: profile.emailWeeklyDigest ?? true,
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (newPreferences: typeof preferences) => {
      const response = await apiRequest('PATCH', '/api/profile/email-preferences', newPreferences);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: 'Preferences Updated',
        description: 'Your email notification settings have been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update email preferences. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleToggle = (key: keyof typeof preferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    
    if (key === 'emailNotifications' && !newPreferences.emailNotifications) {
      newPreferences.emailApplicationUpdates = false;
      newPreferences.emailDeadlineReminders = false;
      newPreferences.emailWeeklyDigest = false;
    }
    
    setPreferences(newPreferences);
    updateMutation.mutate(newPreferences);
  };

  const allEnabled = preferences.emailNotifications;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-md">
            <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="emailNotifications" className="text-base font-medium">
              Email Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Master toggle for all email notifications
            </p>
          </div>
        </div>
        <Switch
          id="emailNotifications"
          checked={preferences.emailNotifications}
          onCheckedChange={() => handleToggle('emailNotifications')}
          data-testid="switch-email-notifications"
        />
      </div>

      <div className="border-t pt-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Customize which types of emails you receive:
        </p>

        <div className={`flex items-center justify-between gap-4 ${!allEnabled ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="emailApplicationUpdates" className="text-sm font-medium">
                Application Updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Confirmations, approvals, and status changes
              </p>
            </div>
          </div>
          <Switch
            id="emailApplicationUpdates"
            checked={preferences.emailApplicationUpdates}
            onCheckedChange={() => handleToggle('emailApplicationUpdates')}
            disabled={!allEnabled}
            data-testid="switch-application-updates"
          />
        </div>

        <div className={`flex items-center justify-between gap-4 ${!allEnabled ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-md">
              <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="emailDeadlineReminders" className="text-sm font-medium">
                Deadline Reminders
              </Label>
              <p className="text-xs text-muted-foreground">
                Alerts for upcoming deadlines and pending actions
              </p>
            </div>
          </div>
          <Switch
            id="emailDeadlineReminders"
            checked={preferences.emailDeadlineReminders}
            onCheckedChange={() => handleToggle('emailDeadlineReminders')}
            disabled={!allEnabled}
            data-testid="switch-deadline-reminders"
          />
        </div>

        <div className={`flex items-center justify-between gap-4 ${!allEnabled ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="emailWeeklyDigest" className="text-sm font-medium">
                Weekly Digest
              </Label>
              <p className="text-xs text-muted-foreground">
                Summary of all application statuses sent weekly
              </p>
            </div>
          </div>
          <Switch
            id="emailWeeklyDigest"
            checked={preferences.emailWeeklyDigest}
            onCheckedChange={() => handleToggle('emailWeeklyDigest')}
            disabled={!allEnabled}
            data-testid="switch-weekly-digest"
          />
        </div>
      </div>

      {updateMutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );

  if (variant === 'inline') {
    return content;
  }

  return (
    <Card data-testid="card-email-preferences">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Manage how you receive updates about your scholarship applications
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

export default EmailPreferences;
