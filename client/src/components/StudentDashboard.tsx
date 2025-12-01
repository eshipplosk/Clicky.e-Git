import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, BookOpen, Clock, TrendingUp, Sparkles, ArrowRight, TrendingDown, BadgeDollarSign, Landmark } from 'lucide-react';
import { ScholarshipCard } from './ScholarshipCard';
import { ProfileCompletionIndicator } from './ProfileCompletionIndicator';
import { MotivationalMessage } from './MotivationalMessage';
import { Link } from 'wouter';
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

  const { data: financialData } = useQuery<any>({
    queryKey: ['/api/financial-aid-summary'],
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

  // Calculate financial summary
  const tuition = Number(profile?.tuitionAmount) || 0;
  const housing = Number(profile?.housingCost) || 0;
  const fees = Number(profile?.feesCost) || 0;
  const dining = Number(profile?.diningCost) || 0;
  const books = Number(profile?.booksCost) || 0;
  const personal = Number(profile?.personalCost) || 0;
  const transportation = Number(profile?.transportationCost) || 0;
  const totalCost = tuition + housing + fees + dining + books + personal + transportation;
  const totalScholarships = Number(financialData?.totalScholarships) || 0;
  const grants = Number(profile?.grantsAmount) || 0;
  const loans = Number(profile?.loansAmount) || 0;
  const totalFinancialAid = totalScholarships + grants + loans;
  const remainingBalance = totalCost - totalFinancialAid;
  const coveragePercentage = totalCost > 0 ? (totalFinancialAid / totalCost) * 100 : 0;
  const hasSurplus = totalFinancialAid > totalCost && totalCost > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-welcome">Welcome back, {studentName}!</h1>
        <p className="text-muted-foreground mt-1">Here's your scholarship overview</p>
      </div>

      <MotivationalMessage />

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

      {/* Financial Overview Summary */}
      {totalCost > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Total Annual Cost</span>
                </div>
                <p className="text-2xl font-bold" data-testid="text-total-cost">
                  ${totalCost.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>Scholarships</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-scholarships">
                  ${totalScholarships.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BadgeDollarSign className="h-4 w-4" />
                  <span>Grants & Aid</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-total-grants">
                  ${grants.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Landmark className="h-4 w-4" />
                  <span>Loans</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-total-loans">
                  ${loans.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {hasSurplus ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{hasSurplus ? 'Surplus Funding' : 'Remaining Balance'}</span>
                </div>
                <p 
                  className={`text-2xl font-bold ${remainingBalance > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}
                  data-testid="text-remaining-balance"
                >
                  {hasSurplus ? '+' : ''}${Math.abs(remainingBalance).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Financial Aid Coverage</span>
                <span className="font-medium">{Math.min(coveragePercentage, 100).toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(coveragePercentage, 100)} className="h-3" data-testid="progress-coverage" />
            </div>

            <div className="pt-4 border-t">
              <Link href="/student/financial-details">
                <Button className="w-full gap-2" data-testid="button-view-financial-details">
                  View Detailed Financial Breakdown
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

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
                onClick={() => {
                  if (acceptedScholarshipIds.has(scholarship.id)) {
                    setLocation(`/student/applications/${scholarship.id}/details`);
                  }
                }}
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
