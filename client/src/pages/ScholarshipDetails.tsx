import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  Calendar, 
  DollarSign, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Users,
  Target,
  Award,
  BookOpen
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Scholarship {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  category: string;
  eligibility: string;
  minGPA?: number;
  minACT?: number;
  minSAT?: number;
  minLSAT?: number;
  minGRE?: number;
  ethnicityRequirements?: string[];
  requiresFirstGen?: boolean;
  requiresVeteran?: boolean;
  requiresDisability?: boolean;
  majorRequirements?: string[];
  skillRequirements?: string[];
  minVolunteerHours?: number;
  requiresEssay?: boolean;
  requiredDocuments?: string[];
  status: string;
}

interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  status: string;
}

interface StudentProfile {
  gpa?: string;
  actScore?: number;
  satScore?: number;
  lsatScore?: number;
  greScore?: number;
  ethnicity?: string;
  firstGeneration?: boolean;
  veteran?: boolean;
  disability?: boolean;
  major?: string;
  skills?: string[];
  volunteerHours?: number;
}

const documentDescriptions: Record<string, string> = {
  'transcript': 'Official or unofficial academic transcript showing your grades and coursework',
  'essay': 'Personal statement or essay responding to the scholarship prompt',
  'recommendation': 'Letter of recommendation from a teacher, counselor, or mentor',
  'resume': 'Current resume highlighting your achievements and activities',
  'financial_aid': 'FAFSA or other financial documentation',
  'proof_of_enrollment': 'Current enrollment verification from your institution',
  'id_verification': 'Valid government-issued identification',
  'portfolio': 'Work samples or portfolio demonstrating your skills',
  'community_service': 'Documentation of volunteer hours or community service',
  'awards': 'Certificates or documentation of awards and achievements',
};

export default function ScholarshipDetails() {
  const [, params] = useRoute("/student/scholarships/:id");
  const scholarshipId = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: scholarship, isLoading } = useQuery<Scholarship>({
    queryKey: [`/api/scholarships/${scholarshipId}`],
    enabled: !!scholarshipId
  });

  const { data: applications = [] } = useQuery<ScholarshipApplication[]>({
    queryKey: ['/api/scholarship-applications'],
  });

  const { data: profile } = useQuery<StudentProfile>({
    queryKey: ['/api/profile'],
  });

  const isApplied = applications.some(app => app.scholarshipId === scholarshipId);
  const application = applications.find(app => app.scholarshipId === scholarshipId);

  const applyMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('POST', '/api/scholarship-applications', { scholarshipId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scholarship-applications'] });
      toast({
        title: "Application Started",
        description: "You've started your application for this scholarship.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start application. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading scholarship details...</p>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Scholarship Not Found</CardTitle>
            <CardDescription>The scholarship you're looking for doesn't exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/student/scholarships">
              <Button data-testid="button-back-scholarships">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Scholarships
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysRemaining = differenceInDays(new Date(scholarship.deadline), new Date());
  const isExpired = daysRemaining < 0;
  const isUrgent = daysRemaining <= 7 && daysRemaining >= 0;

  const getDeadlineColor = () => {
    if (isExpired) return 'text-destructive';
    if (daysRemaining <= 3) return 'text-destructive';
    if (daysRemaining <= 7) return 'text-yellow-600 dark:text-yellow-500';
    return 'text-green-600 dark:text-green-500';
  };

  const checkRequirementMet = (requirement: string, value: any): boolean | null => {
    if (!profile) return null;
    
    switch (requirement) {
      case 'gpa':
        const userGPA = parseFloat(profile.gpa || '0');
        return userGPA >= value;
      case 'act':
        return (profile.actScore || 0) >= value;
      case 'sat':
        return (profile.satScore || 0) >= value;
      case 'lsat':
        return (profile.lsatScore || 0) >= value;
      case 'gre':
        return (profile.greScore || 0) >= value;
      case 'firstGen':
        return profile.firstGeneration === value;
      case 'veteran':
        return profile.veteran === value;
      case 'disability':
        return profile.disability === value;
      case 'volunteerHours':
        return (profile.volunteerHours || 0) >= value;
      default:
        return null;
    }
  };

  const requirements = [];
  
  if (scholarship.minGPA) {
    const met = checkRequirementMet('gpa', scholarship.minGPA);
    requirements.push({ label: `Minimum GPA: ${scholarship.minGPA}`, met, icon: GraduationCap });
  }
  if (scholarship.minACT) {
    const met = checkRequirementMet('act', scholarship.minACT);
    requirements.push({ label: `Minimum ACT Score: ${scholarship.minACT}`, met, icon: Target });
  }
  if (scholarship.minSAT) {
    const met = checkRequirementMet('sat', scholarship.minSAT);
    requirements.push({ label: `Minimum SAT Score: ${scholarship.minSAT}`, met, icon: Target });
  }
  if (scholarship.minLSAT) {
    const met = checkRequirementMet('lsat', scholarship.minLSAT);
    requirements.push({ label: `Minimum LSAT Score: ${scholarship.minLSAT}`, met, icon: Target });
  }
  if (scholarship.minGRE) {
    const met = checkRequirementMet('gre', scholarship.minGRE);
    requirements.push({ label: `Minimum GRE Score: ${scholarship.minGRE}`, met, icon: Target });
  }
  if (scholarship.requiresFirstGen) {
    const met = checkRequirementMet('firstGen', true);
    requirements.push({ label: 'First-generation college student', met, icon: Users });
  }
  if (scholarship.requiresVeteran) {
    const met = checkRequirementMet('veteran', true);
    requirements.push({ label: 'Military veteran or active duty', met, icon: Award });
  }
  if (scholarship.requiresDisability) {
    const met = checkRequirementMet('disability', true);
    requirements.push({ label: 'Student with disability', met, icon: Users });
  }
  if (scholarship.minVolunteerHours) {
    const met = checkRequirementMet('volunteerHours', scholarship.minVolunteerHours);
    requirements.push({ label: `Minimum ${scholarship.minVolunteerHours} volunteer hours`, met, icon: Users });
  }
  if (scholarship.majorRequirements && scholarship.majorRequirements.length > 0) {
    const userMajor = profile?.major?.toLowerCase() || '';
    const met = scholarship.majorRequirements.some(m => userMajor.includes(m.toLowerCase()));
    requirements.push({ 
      label: `Major: ${scholarship.majorRequirements.join(', ')}`, 
      met: profile ? met : null, 
      icon: BookOpen 
    });
  }
  if (scholarship.ethnicityRequirements && scholarship.ethnicityRequirements.length > 0) {
    const userEthnicity = profile?.ethnicity?.toLowerCase() || '';
    const met = scholarship.ethnicityRequirements.some(e => e.toLowerCase() === userEthnicity);
    requirements.push({ 
      label: `Ethnicity: ${scholarship.ethnicityRequirements.join(', ')}`, 
      met: profile ? met : null, 
      icon: Users 
    });
  }

  const metRequirements = requirements.filter(r => r.met === true).length;
  const totalRequirements = requirements.length;
  const matchPercentage = totalRequirements > 0 ? Math.round((metRequirements / totalRequirements) * 100) : 100;

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/student/scholarships">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" data-testid="text-scholarship-title">{scholarship.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" data-testid="badge-category">{scholarship.category}</Badge>
            {isApplied && (
              <Badge variant="default" className="gap-1" data-testid="badge-applied">
                <CheckCircle2 className="h-3 w-3" />
                Applied
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              About This Scholarship
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground" data-testid="text-description">
              {scholarship.description}
            </p>
            
            <Separator />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Award Amount</p>
                  <p className="font-semibold text-lg" data-testid="text-amount">
                    ${scholarship.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${isExpired ? 'bg-destructive/10' : isUrgent ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                  <Calendar className={`h-5 w-5 ${getDeadlineColor()}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className={`font-semibold ${getDeadlineColor()}`} data-testid="text-deadline">
                    {format(new Date(scholarship.deadline), 'MMMM d, yyyy')}
                  </p>
                  <p className={`text-xs ${getDeadlineColor()}`}>
                    {isExpired 
                      ? 'Deadline passed' 
                      : daysRemaining === 0 
                        ? 'Due today!' 
                        : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Match</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold" data-testid="text-match-score">{matchPercentage}%</span>
              <p className="text-sm text-muted-foreground">Match Score</p>
            </div>
            <Progress value={matchPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {profile 
                ? `You meet ${metRequirements} of ${totalRequirements} requirements`
                : 'Complete your profile for accurate matching'}
            </p>
            
            {!isApplied && !isExpired && (
              <Button 
                className="w-full" 
                onClick={() => applyMutation.mutate(scholarship.id)}
                disabled={applyMutation.isPending}
                data-testid="button-apply"
              >
                {applyMutation.isPending ? 'Starting Application...' : 'Start Application'}
              </Button>
            )}
            
            {isApplied && application && (
              <Button 
                className="w-full" 
                onClick={() => setLocation(`/student/applications/${scholarship.id}/details`)}
                data-testid="button-view-application"
              >
                View My Application
              </Button>
            )}
            
            {isExpired && (
              <Button className="w-full" disabled variant="secondary">
                Deadline Passed
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Eligibility Requirements
            </CardTitle>
            <CardDescription>
              Review the requirements below to see if you qualify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {requirements.map((req, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-md bg-muted/50"
                  data-testid={`requirement-${index}`}
                >
                  {req.met === true && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                  {req.met === false && (
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}
                  {req.met === null && (
                    <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm">{req.label}</span>
                </div>
              ))}
            </div>
            {!profile && (
              <p className="text-sm text-muted-foreground mt-4">
                <Link href="/student/profile" className="text-primary underline">Complete your profile</Link>
                {' '}to see which requirements you meet.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {scholarship.requiredDocuments && scholarship.requiredDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required Documents
            </CardTitle>
            <CardDescription>
              You'll need to submit these documents with your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scholarship.requiredDocuments.map((doc, index) => {
                const docKey = doc.toLowerCase().replace(/\s+/g, '_');
                const description = documentDescriptions[docKey] || `Required ${doc} for this application`;
                
                return (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-md border bg-card"
                    data-testid={`document-${index}`}
                  >
                    <div className="p-2 rounded-md bg-muted">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{doc.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {scholarship.requiresEssay && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Essay Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This scholarship requires you to submit an essay. The essay prompt and guidelines will be provided when you start your application.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center pt-4">
        <Link href="/student/scholarships">
          <Button variant="outline" data-testid="button-back-list">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to All Scholarships
          </Button>
        </Link>
        
        {!isApplied && !isExpired && (
          <Button 
            onClick={() => applyMutation.mutate(scholarship.id)}
            disabled={applyMutation.isPending}
            data-testid="button-apply-bottom"
          >
            {applyMutation.isPending ? 'Starting...' : 'Start Application'}
          </Button>
        )}
      </div>
    </div>
  );
}
