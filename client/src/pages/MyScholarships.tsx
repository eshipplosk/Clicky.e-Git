import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Award, Calendar, DollarSign, Trash2, FileText } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Scholarship } from '@shared/schema';

interface ScholarshipWithApplication extends Scholarship {
  applicationId: string;
}

export default function MyScholarships() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: scholarships = [], isLoading } = useQuery<ScholarshipWithApplication[]>({
    queryKey: ['/api/scholarship-applications'],
  });

  const removeMutation = useMutation({
    mutationFn: async (scholarshipId: string) => {
      return await apiRequest("DELETE", `/api/scholarship-applications/${scholarshipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scholarship-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-aid-summary"] });
      toast({
        title: "Scholarship removed",
        description: "The scholarship has been removed from your list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove scholarship",
        variant: "destructive",
      });
    },
  });

  const totalAmount = scholarships.reduce((sum, s) => sum + (s.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Link href="/student/dashboard">
        <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Scholarships</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage your scholarship applications
        </p>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md" style={{ backgroundColor: 'hsl(var(--brand-yellow) / 0.15)' }}>
                <Award className="h-6 w-6" style={{ color: 'hsl(var(--brand-yellow))' }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Scholarships</p>
                <p className="text-2xl font-bold" data-testid="text-total-count">{scholarships.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md" style={{ backgroundColor: 'hsl(var(--brand-yellow) / 0.15)' }}>
                <DollarSign className="h-6 w-6" style={{ color: 'hsl(var(--brand-yellow))' }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-amount">
                  ${totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scholarships List */}
      {scholarships.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scholarships yet</h3>
            <p className="text-muted-foreground mb-4">
              Start applying to scholarships to build your financial aid portfolio
            </p>
            <Link href="/student/scholarships">
              <Button data-testid="button-browse-scholarships">Browse Scholarships</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scholarships.map((scholarship) => (
            <Card key={scholarship.id} className="hover-elevate" data-testid={`card-scholarship-${scholarship.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{scholarship.title}</h3>
                        <Badge variant="secondary" className="mt-1">{scholarship.category}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {scholarship.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-foreground">${scholarship.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Deadline: {new Date(scholarship.deadline).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/student/applications/${scholarship.id}/details`)}
                      data-testid={`button-view-${scholarship.id}`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMutation.mutate(scholarship.id)}
                      disabled={removeMutation.isPending}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-remove-${scholarship.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
