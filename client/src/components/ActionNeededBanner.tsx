/**
 * ActionNeededBanner Component
 * 
 * Displays a prominent banner at the top of the scholarship portal when
 * a student's profile is incomplete or applications require updates.
 * 
 * The banner automatically:
 * - Checks profile completion status (same 15 fields as ProfileCompletionIndicator)
 * - Identifies missing required fields grouped by category
 * - Shows clear action items with direct links
 * - Disappears when all requirements are met
 * 
 * Note: Uses the same field validation logic as ProfileCompletionIndicator
 * to ensure consistency across the application.
 */

import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { AlertTriangle, ArrowRight, X, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import type { StudentProfile } from '@shared/schema';

// Define profile field requirements - matches ProfileCompletionIndicator exactly
interface ProfileRequirement {
  id: string;
  label: string;
  category: 'personal' | 'academic' | 'achievements' | 'financial';
  checkFilled: (profile: StudentProfile) => boolean;
}

// Category labels and order for display
const CATEGORY_CONFIG: Record<string, { label: string; order: number }> = {
  personal: { label: 'Personal Info', order: 1 },
  academic: { label: 'Academic Details', order: 2 },
  achievements: { label: 'Achievements', order: 3 },
  financial: { label: 'Financial Info', order: 4 },
};

/**
 * Profile requirements matching ProfileCompletionIndicator's 15 tracked fields
 * This ensures the banner shows/hides consistently with the completion percentage
 */
const PROFILE_REQUIREMENTS: ProfileRequirement[] = [
  // Personal Info (3 fields)
  { 
    id: 'firstName', 
    label: 'First Name', 
    category: 'personal',
    checkFilled: (p) => isFieldFilled(p.firstName)
  },
  { 
    id: 'lastName', 
    label: 'Last Name', 
    category: 'personal',
    checkFilled: (p) => isFieldFilled(p.lastName)
  },
  { 
    id: 'email', 
    label: 'Email', 
    category: 'personal',
    checkFilled: (p) => isFieldFilled(p.email)
  },
  
  // Academic Details (4 fields - including test score as one combined field)
  { 
    id: 'major', 
    label: 'Major', 
    category: 'academic',
    checkFilled: (p) => isFieldFilled(p.major)
  },
  { 
    id: 'gpa', 
    label: 'GPA', 
    category: 'academic',
    checkFilled: (p) => isFieldFilled(p.gpa)
  },
  { 
    id: 'testScore', 
    label: 'Test Score (ACT, SAT, LSAT, or GRE)', 
    category: 'academic',
    checkFilled: (p) => Boolean(p.actScore || p.satScore || p.lsatScore || p.greScore)
  },
  { 
    id: 'academicYear', 
    label: 'Academic Year', 
    category: 'academic',
    checkFilled: (p) => isFieldFilled(p.academicYear)
  },
  
  // Demographics (2 fields - counted in academic for grouping)
  { 
    id: 'ethnicity', 
    label: 'Ethnicity', 
    category: 'personal',
    checkFilled: (p) => isFieldFilled(p.ethnicity)
  },
  { 
    id: 'gender', 
    label: 'Gender', 
    category: 'personal',
    checkFilled: (p) => isFieldFilled(p.gender)
  },
  
  // Achievements (4 fields)
  { 
    id: 'extracurriculars', 
    label: 'Extracurricular Activities', 
    category: 'achievements',
    checkFilled: (p) => Boolean(p.extracurriculars?.length)
  },
  { 
    id: 'skills', 
    label: 'Skills', 
    category: 'achievements',
    checkFilled: (p) => Boolean(p.skills?.length)
  },
  { 
    id: 'volunteerHours', 
    label: 'Volunteer Hours', 
    category: 'achievements',
    checkFilled: (p) => isFieldFilled(p.volunteerHours)
  },
  { 
    id: 'leadershipRoles', 
    label: 'Leadership Roles', 
    category: 'achievements',
    checkFilled: (p) => Boolean(p.leadershipRoles?.length)
  },
  
  // Financial (2 fields)
  { 
    id: 'financialNeed', 
    label: 'Financial Need Level', 
    category: 'financial',
    checkFilled: (p) => isFieldFilled(p.financialNeed)
  },
  { 
    id: 'tuitionAmount', 
    label: 'Tuition Amount', 
    category: 'financial',
    checkFilled: (p) => isFieldFilled(p.tuitionAmount)
  },
];

/**
 * Checks if a profile field is considered "filled"
 * Matches the logic in ProfileCompletionIndicator
 */
function isFieldFilled(value: unknown): boolean {
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  return value != null && value !== '';
}

/**
 * Analyzes profile and returns missing fields with completion percentage
 * Uses the same calculation as ProfileCompletionIndicator
 */
function analyzeProfileCompletion(profile: StudentProfile | null | undefined): {
  missingFields: ProfileRequirement[];
  completionPercentage: number;
} {
  if (!profile) {
    return {
      missingFields: PROFILE_REQUIREMENTS,
      completionPercentage: 0,
    };
  }

  const missingFields = PROFILE_REQUIREMENTS.filter((req) => !req.checkFilled(profile));
  const filledCount = PROFILE_REQUIREMENTS.length - missingFields.length;
  const completionPercentage = Math.round((filledCount / PROFILE_REQUIREMENTS.length) * 100);

  return { missingFields, completionPercentage };
}

export function ActionNeededBanner() {
  // Allow user to temporarily dismiss the banner (resets on page reload)
  const [isDismissed, setIsDismissed] = useState(false);

  // Fetch current profile data from API
  const { data: profile, isLoading } = useQuery<StudentProfile>({
    queryKey: ['/api/profile'],
  });

  // Analyze what's missing from the profile
  const { missingFields, completionPercentage } = useMemo(
    () => analyzeProfileCompletion(profile),
    [profile]
  );

  // Group missing fields by category for organized display
  const groupedMissingFields = useMemo(() => {
    const groups: Record<string, string[]> = {};
    missingFields.forEach((field) => {
      if (!groups[field.category]) {
        groups[field.category] = [];
      }
      groups[field.category].push(field.label);
    });
    
    // Sort groups by category order
    const sortedEntries = Object.entries(groups).sort(([a], [b]) => 
      CATEGORY_CONFIG[a].order - CATEGORY_CONFIG[b].order
    );
    
    return sortedEntries;
  }, [missingFields]);

  // Profile is complete when all fields are filled
  const isProfileComplete = completionPercentage === 100;

  // Don't show banner if dismissed, loading, or profile is complete
  if (isDismissed || isLoading || isProfileComplete) {
    return null;
  }

  // Build concise action items list for display
  const actionItems: string[] = [];
  groupedMissingFields.forEach(([category, fields]) => {
    if (fields.length === 1) {
      actionItems.push(fields[0]);
    } else if (fields.length === 2) {
      actionItems.push(...fields);
    } else {
      actionItems.push(`${CATEGORY_CONFIG[category].label} (${fields.length} items)`);
    }
  });

  // Limit displayed items to avoid overwhelming the user
  const displayItems = actionItems.slice(0, 3);
  const remainingCount = actionItems.length - displayItems.length;

  return (
    <div 
      className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800"
      role="alert"
      aria-live="polite"
      data-testid="banner-action-needed"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Alert Icon and Message */}
          <div className="flex items-start sm:items-center gap-3 flex-1">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-md shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-amber-800 dark:text-amber-200" data-testid="text-banner-title">
                Action Needed: Complete Your Profile
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                <span className="hidden sm:inline">Missing: </span>
                {displayItems.join(', ')}
                {remainingCount > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {' '}and {remainingCount} more item{remainingCount !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Link href="/student/profile" className="flex-1 sm:flex-none">
              <Button 
                size="sm" 
                className="w-full sm:w-auto gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                data-testid="button-complete-profile"
              >
                <UserCircle className="h-4 w-4" />
                Complete Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            {/* Dismiss button - temporarily hides banner until page reload */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsDismissed(true)}
              className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-900/50"
              aria-label="Dismiss banner temporarily"
              data-testid="button-dismiss-banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress indicator showing profile completion */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 dark:bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
              data-testid="progress-profile-completion"
            />
          </div>
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300 shrink-0">
            {completionPercentage}% complete
          </span>
        </div>
      </div>
    </div>
  );
}

export default ActionNeededBanner;
