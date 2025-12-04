import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Circle, User, FileText, Upload, Send, Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentProfile, ScholarshipApplication } from "@shared/schema";

export type ApplicationStage = 
  | 'account_created'
  | 'profile_completed'
  | 'application_started'
  | 'documents_uploaded'
  | 'application_submitted'
  | 'under_review'
  | 'decision_made';

interface StageConfig {
  id: ApplicationStage;
  label: string;
  shortLabel: string;
  icon: typeof CheckCircle;
  description: string;
}

const STAGES: StageConfig[] = [
  {
    id: 'account_created',
    label: 'Account Created',
    shortLabel: 'Account',
    icon: User,
    description: 'Your account has been created'
  },
  {
    id: 'profile_completed',
    label: 'Profile Completed',
    shortLabel: 'Profile',
    icon: FileText,
    description: 'Complete your profile and eligibility information'
  },
  {
    id: 'application_started',
    label: 'Application Started',
    shortLabel: 'Started',
    icon: FileText,
    description: 'Begin your scholarship application'
  },
  {
    id: 'documents_uploaded',
    label: 'Documents Uploaded',
    shortLabel: 'Documents',
    icon: Upload,
    description: 'Upload all required documents'
  },
  {
    id: 'application_submitted',
    label: 'Application Submitted',
    shortLabel: 'Submitted',
    icon: Send,
    description: 'Your application has been submitted'
  },
  {
    id: 'under_review',
    label: 'Under Review',
    shortLabel: 'Review',
    icon: Clock,
    description: 'Your application is being reviewed'
  },
  {
    id: 'decision_made',
    label: 'Decision Made',
    shortLabel: 'Decision',
    icon: Award,
    description: 'A decision has been made on your application'
  }
];

const REQUIRED_PROFILE_FIELDS = [
  'firstName', 'lastName', 'email', 'major', 'gpa', 'academicYear',
  'ethnicity', 'gender', 'financialNeed', 'tuitionAmount'
];

function isProfileComplete(profile: StudentProfile | null | undefined): boolean {
  if (!profile) return false;
  
  for (const field of REQUIRED_PROFILE_FIELDS) {
    const value = profile[field as keyof StudentProfile];
    if (value === null || value === undefined || value === '') {
      return false;
    }
  }
  
  const hasTestScore = !!(profile.actScore || profile.satScore || profile.lsatScore || profile.greScore);
  if (!hasTestScore) return false;
  
  const hasExtracurriculars = !!(profile.extracurriculars && profile.extracurriculars.length > 0);
  const hasSkills = !!(profile.skills && profile.skills.length > 0);
  const hasLeadership = !!(profile.leadershipRoles && profile.leadershipRoles.length > 0);
  
  return hasExtracurriculars && hasSkills && hasLeadership;
}

interface ApplicationProgressBarProps {
  applicationId?: string;
  scholarshipId?: string;
  showLabels?: boolean;
  compact?: boolean;
  className?: string;
}

export function ApplicationProgressBar({
  applicationId,
  scholarshipId,
  showLabels = true,
  compact = false,
  className
}: ApplicationProgressBarProps) {
  const { data: profile } = useQuery<StudentProfile>({
    queryKey: ['/api/profile'],
  });

  const { data: applications = [] } = useQuery<ScholarshipApplication[]>({
    queryKey: ['/api/scholarship-applications'],
  });

  const { data: documents = [] } = useQuery<Array<{ applicationId: string; status: string }>>({
    queryKey: ['/api/application-documents', applicationId],
    enabled: !!applicationId,
  });

  const application = applicationId 
    ? applications.find(a => a.id === applicationId)
    : scholarshipId
      ? applications.find(a => a.scholarshipId === scholarshipId)
      : applications[0];

  const currentStage = determineCurrentStage(profile, application, documents);
  const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);
  const decisionStatus = application?.status === 'accepted' ? 'approved' : 
                        application?.status === 'declined' ? 'not_selected' : null;

  return (
    <div className={cn("w-full", className)} data-testid="application-progress-bar">
      <div className="relative">
        {/* Progress line background */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-muted rounded-full" />
        
        {/* Progress line filled */}
        <div 
          className="absolute top-4 left-0 h-1 bg-primary rounded-full transition-all duration-500"
          style={{ 
            width: `${Math.min(100, (currentStageIndex / (STAGES.length - 1)) * 100)}%` 
          }}
        />
        
        {/* Stage indicators */}
        <div className="relative flex justify-between">
          {STAGES.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;
            const StageIcon = stage.icon;
            
            let statusColor = "bg-muted text-muted-foreground";
            let iconColor = "text-muted-foreground";
            
            if (isCompleted) {
              statusColor = "bg-primary text-primary-foreground";
              iconColor = "text-primary-foreground";
            } else if (isCurrent) {
              if (stage.id === 'decision_made') {
                if (decisionStatus === 'approved') {
                  statusColor = "bg-green-500 text-white";
                  iconColor = "text-white";
                } else if (decisionStatus === 'not_selected') {
                  statusColor = "bg-red-500 text-white";
                  iconColor = "text-white";
                } else {
                  statusColor = "bg-primary text-primary-foreground ring-4 ring-primary/20";
                  iconColor = "text-primary-foreground";
                }
              } else {
                statusColor = "bg-primary text-primary-foreground ring-4 ring-primary/20";
                iconColor = "text-primary-foreground";
              }
            }

            return (
              <div 
                key={stage.id}
                className="flex flex-col items-center"
                data-testid={`progress-stage-${stage.id}`}
              >
                {/* Stage circle */}
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full transition-all duration-300",
                    compact ? "w-6 h-6" : "w-8 h-8",
                    statusColor
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className={cn(compact ? "w-4 h-4" : "w-5 h-5", iconColor)} />
                  ) : (
                    <StageIcon className={cn(compact ? "w-3 h-3" : "w-4 h-4", iconColor)} />
                  )}
                </div>
                
                {/* Stage label */}
                {showLabels && (
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "text-xs font-medium leading-tight",
                      isCurrent ? "text-primary" : 
                      isCompleted ? "text-foreground" : 
                      "text-muted-foreground"
                    )}>
                      {compact ? stage.shortLabel : stage.label}
                    </p>
                    {isCurrent && stage.id === 'decision_made' && decisionStatus && (
                      <p className={cn(
                        "text-xs font-semibold mt-0.5",
                        decisionStatus === 'approved' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {decisionStatus === 'approved' ? 'Approved' : 'Not Selected'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Current stage description */}
      {!compact && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {currentStageIndex < STAGES.length && STAGES[currentStageIndex].description}
          </p>
        </div>
      )}
    </div>
  );
}

function determineCurrentStage(
  profile: StudentProfile | null | undefined,
  application: ScholarshipApplication | null | undefined,
  documents: Array<{ applicationId: string; status: string }> | undefined
): ApplicationStage {
  if (!profile) {
    return 'account_created';
  }
  
  if (!isProfileComplete(profile)) {
    return 'account_created';
  }
  
  if (!application) {
    return 'profile_completed';
  }
  
  if (application.status === 'accepted') {
    return 'decision_made';
  }
  
  if (application.status === 'declined') {
    return 'decision_made';
  }
  
  const uploadedDocs = documents?.filter(d => d.status === 'uploaded') || [];
  const hasUploadedDocs = uploadedDocs.length > 0;
  
  if (!hasUploadedDocs) {
    return 'application_started';
  }
  
  if (application.status === 'pending') {
    return 'under_review';
  }
  
  return 'application_submitted';
}

interface OverallProgressBarProps {
  className?: string;
}

export function OverallProgressBar({ className }: OverallProgressBarProps) {
  const { data: profile } = useQuery<StudentProfile>({
    queryKey: ['/api/profile'],
  });

  const { data: applications = [] } = useQuery<ScholarshipApplication[]>({
    queryKey: ['/api/scholarship-applications'],
  });

  const profileComplete = isProfileComplete(profile);
  const hasApplications = applications.length > 0;
  const hasApproved = applications.some(a => a.status === 'accepted');
  const hasPending = applications.some(a => a.status === 'pending');
  
  let overallStage: ApplicationStage = 'account_created';
  
  if (profileComplete) {
    overallStage = 'profile_completed';
  }
  
  if (hasApplications) {
    overallStage = 'application_started';
    
    if (hasPending) {
      overallStage = 'under_review';
    }
    
    if (hasApproved) {
      overallStage = 'decision_made';
    }
  }

  const stageIndex = STAGES.findIndex(s => s.id === overallStage);
  const progressPercentage = Math.min(100, ((stageIndex + 1) / STAGES.length) * 100);

  return (
    <div className={cn("space-y-2", className)} data-testid="overall-progress-bar">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Application Progress</span>
        <span className="text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Current Stage: {STAGES[stageIndex]?.label || 'Getting Started'}
      </p>
    </div>
  );
}

export function MiniProgressIndicator({ 
  applicationId,
  scholarshipId 
}: { 
  applicationId?: string;
  scholarshipId?: string;
}) {
  const { data: profile } = useQuery<StudentProfile>({
    queryKey: ['/api/profile'],
  });

  const { data: applications = [] } = useQuery<ScholarshipApplication[]>({
    queryKey: ['/api/scholarship-applications'],
  });

  const application = applicationId 
    ? applications.find(a => a.id === applicationId)
    : scholarshipId
      ? applications.find(a => a.scholarshipId === scholarshipId)
      : null;

  const currentStage = determineCurrentStage(profile, application, []);
  const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);
  const totalStages = STAGES.length;

  const stageLabel = STAGES[currentStageIndex]?.shortLabel || 'Started';
  
  let statusColor = "text-primary";
  if (application?.status === 'accepted') {
    statusColor = "text-green-600 dark:text-green-400";
  } else if (application?.status === 'declined') {
    statusColor = "text-red-600 dark:text-red-400";
  }

  return (
    <div className="flex items-center gap-2" data-testid="mini-progress-indicator">
      <div className="flex gap-0.5">
        {Array.from({ length: totalStages }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              i <= currentStageIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
      <span className={cn("text-xs font-medium", statusColor)}>
        {application?.status === 'accepted' ? 'Approved' :
         application?.status === 'declined' ? 'Not Selected' :
         stageLabel}
      </span>
    </div>
  );
}
