import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import type { StudentProfile } from '@shared/schema';

interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  major?: string | null;
  gpa?: string | null;
  actScore?: string | number | null;
  satScore?: string | number | null;
  lsatScore?: string | number | null;
  greScore?: string | number | null;
  academicYear?: string | null;
  ethnicity?: string | null;
  gender?: string | null;
  extracurriculars?: string[] | null;
  skills?: string[] | null;
  volunteerHours?: string | number | null;
  leadershipRoles?: string[] | null;
  financialNeed?: string | null;
  tuitionAmount?: string | number | null;
}

interface ProfileCompletionIndicatorProps {
  profile: StudentProfile | ProfileData | null | undefined;
  onCompleteProfile?: () => void;
  variant?: 'card' | 'inline';
}

export function ProfileCompletionIndicator({ 
  profile, 
  onCompleteProfile,
  variant = 'card'
}: ProfileCompletionIndicatorProps) {
  const calculateCompletion = (): number => {
    if (!profile) return 0;

    const fields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.major,
      profile.gpa,
      profile.actScore || profile.satScore || profile.lsatScore || profile.greScore,
      profile.academicYear,
      profile.ethnicity,
      profile.gender,
      profile.extracurriculars?.length,
      profile.skills?.length,
      profile.volunteerHours,
      profile.leadershipRoles?.length,
      profile.financialNeed,
      profile.tuitionAmount,
    ];

    const filledFields = fields.filter(field => {
      if (typeof field === 'number') return true;
      if (typeof field === 'boolean') return true;
      return field != null && field !== '';
    }).length;

    return Math.round((filledFields / fields.length) * 100);
  };

  const completion = calculateCompletion();
  const isComplete = completion === 100;

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm font-bold" data-testid="text-completion-percentage">
              {completion}%
            </span>
          </div>
          <Progress value={completion} className="h-2" data-testid="progress-profile" />
        </div>
        {!isComplete && onCompleteProfile && (
          <Button onClick={onCompleteProfile} size="sm" data-testid="button-complete-inline">
            Complete
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card data-testid="card-profile-completion">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
        {isComplete ? (
          <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
        ) : (
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2" data-testid="text-completion-card">
          {completion}%
        </div>
        <Progress value={completion} className="mb-3" data-testid="progress-card" />
        {!isComplete && (
          <div>
            <p className="text-xs text-muted-foreground mb-3">
              Complete your profile to unlock better scholarship matches
            </p>
            {onCompleteProfile && (
              <Button onClick={onCompleteProfile} size="sm" className="w-full" data-testid="button-complete-card">
                Complete Profile
              </Button>
            )}
          </div>
        )}
        {isComplete && (
          <p className="text-xs text-green-600 dark:text-green-400">
            Your profile is complete!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
