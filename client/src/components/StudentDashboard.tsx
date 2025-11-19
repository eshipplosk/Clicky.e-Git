import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, BookOpen, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { ScholarshipCard } from './ScholarshipCard';
import { CostBreakdown } from './CostBreakdown';
import { ProfileCompletionIndicator } from './ProfileCompletionIndicator';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import type { Scholarship, StudentProfile } from '@shared/schema';

interface StudentDashboardProps {
  studentName?: string;
  profileCompletion?: number;
  matchingScholarships?: number;
}

export function StudentDashboard({ 
  studentName = 'Sarah',
  profileCompletion = 75,
  matchingScholarships = 12
}: StudentDashboardProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: scholarships = [], isLoading: isLoadingScholarships } = useQuery<Scholarship[]>({
    queryKey: ['/api/scholarships'],
  });

  const { data: acceptedScholarships = [] } = useQuery<Array<{ id: string }>>({
    queryKey: ['/api/scholarship-applications'],
  });

  const { data: profile } = useQuery<StudentProfile>({
    queryKey: ['/api/profile'],
  });

  const acceptScholarshipMutation = useMutation({
    mutationFn: async (scholarshipId: string) => {
      return await apiRequest("POST", "/api/scholarship-applications", { scholarshipId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scholarship-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-aid-summary"] });
      toast({
        title: "Scholarship accepted!",
        description: "The scholarship has been added to your financial aid plan",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept scholarship",
        variant: "destructive",
      });
    },
  });

  const acceptedScholarshipIds = new Set(acceptedScholarships.map(app => app.id));
  const topScholarships = scholarships.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-welcome">Welcome back, {studentName}!</h1>
        <p className="text-muted-foreground mt-1">Here's your scholarship overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matching Scholarships</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-matching-count">{matchingScholarships}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on your profile</p>
          </CardContent>
        </Card>

        <ProfileCompletionIndicator 
          profile={profile}
          onCompleteProfile={() => setLocation('/student/profile')}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-deadlines">3</div>
            <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Potential</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-potential">$18,500</div>
            <p className="text-xs text-muted-foreground mt-1">From matching scholarships</p>
          </CardContent>
        </Card>
      </div>


      <CostBreakdown userId={profile?.userId} />

      {/* AI Assistant CTA */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="flex items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-md">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Scholarship Assistant</h3>
              <p className="text-sm text-muted-foreground">Get personalized scholarship recommendations and expert guidance</p>
            </div>
          </div>
          <Button 
            onClick={() => setLocation('/student/ai-assistant')}
            data-testid="button-ai-assistant"
          >
            Try Now
          </Button>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Top Matches for You</h2>
          <Button variant="outline" data-testid="button-view-all">View All</Button>
        </div>
        
        {isLoadingScholarships ? (
          <div className="text-center py-8">Loading scholarships...</div>
        ) : topScholarships.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No scholarships available yet. Check back soon!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topScholarships.map((scholarship) => (
              <ScholarshipCard
                key={scholarship.id}
                id={scholarship.id}
                title={scholarship.title}
                amount={scholarship.amount}
                deadline={new Date(scholarship.deadline).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                category={scholarship.category}
                eligibility={scholarship.eligibility}
                description={scholarship.description}
                onClick={() => console.log('Scholarship clicked:', scholarship.id)}
                onAccept={(id) => acceptScholarshipMutation.mutate(id)}
                isAccepted={acceptedScholarshipIds.has(scholarship.id)}
                isAccepting={acceptScholarshipMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
