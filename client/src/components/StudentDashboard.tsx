import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { ScholarshipCard } from './ScholarshipCard';

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
  // todo: remove mock functionality
  const mockScholarships = [
    {
      id: '1',
      title: 'STEM Excellence Scholarship',
      amount: 5000,
      deadline: 'March 15, 2025',
      category: 'STEM',
      eligibility: 'GPA 3.5+ in STEM major',
      matchScore: 92,
      description: 'Supporting outstanding students pursuing degrees in Science, Technology, Engineering, and Mathematics.'
    },
    {
      id: '2',
      title: 'Community Service Award',
      amount: 3000,
      deadline: 'April 1, 2025',
      category: 'Community',
      eligibility: '50+ volunteer hours',
      matchScore: 85,
      description: 'Recognizing students who demonstrate exceptional commitment to community service and leadership.'
    },
    {
      id: '3',
      title: 'First Generation College Grant',
      amount: 4500,
      deadline: 'March 30, 2025',
      category: 'Financial Aid',
      eligibility: 'First-gen college student',
      matchScore: 78,
      description: 'Supporting first-generation college students in achieving their educational goals.'
    }
  ];

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-profile-completion">{profileCompletion}%</div>
            <Progress value={profileCompletion} className="mt-2" />
          </CardContent>
        </Card>

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

      {profileCompletion < 100 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">Complete your profile to unlock more scholarships</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add more details to get better scholarship matches
                </p>
              </div>
              <Button data-testid="button-complete-profile">Complete Profile</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Top Matches for You</h2>
          <Button variant="outline" data-testid="button-view-all">View All</Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockScholarships.map((scholarship) => (
            <ScholarshipCard
              key={scholarship.id}
              {...scholarship}
              onClick={() => console.log('Scholarship clicked:', scholarship.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
