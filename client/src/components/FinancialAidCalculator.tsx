import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown, BookOpen, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AcceptedScholarship {
  id: string;
  title: string;
  amount: number;
  applicationId: string;
}

interface FinancialAidSummary {
  tuitionAmount: number;
  totalScholarships: number;
  loanEligible: number;
  acceptedScholarships: AcceptedScholarship[];
}

export function FinancialAidCalculator() {
  const { toast } = useToast();
  
  const { data: summary, isLoading } = useQuery<FinancialAidSummary>({
    queryKey: ["/api/financial-aid-summary"],
  });

  const removeScholarshipMutation = useMutation({
    mutationFn: async (scholarshipId: string) => {
      return await apiRequest("DELETE", `/api/scholarship-applications/${scholarshipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-aid-summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scholarship-applications"] });
      toast({
        title: "Scholarship removed",
        description: "The scholarship has been removed from your financial aid plan",
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

  if (isLoading) {
    return (
      <Card data-testid="card-financial-aid-calculator">
        <CardHeader>
          <CardTitle>Financial Aid Calculator</CardTitle>
          <CardDescription>Loading your financial aid summary...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card data-testid="card-financial-aid-calculator">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Aid Calculator
        </CardTitle>
        <CardDescription>
          Track your tuition costs and scholarship coverage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Tuition</p>
            <p className="text-2xl font-bold" data-testid="text-total-tuition">
              {formatCurrency(summary.tuitionAmount)}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Scholarship Coverage</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-scholarship-coverage">
              -{formatCurrency(summary.totalScholarships)}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Student Loan Eligible</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-loan-eligible">
              {formatCurrency(summary.loanEligible)}
            </p>
          </div>
        </div>

        {summary.tuitionAmount === 0 && (
          <div className="rounded-lg bg-muted p-4" data-testid="alert-no-tuition">
            <p className="text-sm text-muted-foreground">
              Please set your tuition amount in your profile to see accurate calculations.
            </p>
          </div>
        )}

        {summary.acceptedScholarships.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <h3 className="font-semibold">Accepted Scholarships</h3>
              <Badge variant="secondary" data-testid="badge-scholarship-count">
                {summary.acceptedScholarships.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {summary.acceptedScholarships.map((scholarship) => (
                <div
                  key={scholarship.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                  data-testid={`scholarship-item-${scholarship.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium" data-testid={`text-scholarship-title-${scholarship.id}`}>
                      {scholarship.title}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-scholarship-amount-${scholarship.id}`}>
                      {formatCurrency(scholarship.amount)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeScholarshipMutation.mutate(scholarship.id)}
                    disabled={removeScholarshipMutation.isPending}
                    data-testid={`button-remove-scholarship-${scholarship.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.acceptedScholarships.length === 0 && summary.tuitionAmount > 0 && (
          <div className="rounded-lg bg-muted p-4" data-testid="alert-no-scholarships">
            <p className="text-sm text-muted-foreground">
              You haven't accepted any scholarships yet. Browse available scholarships and accept the ones you qualify for.
            </p>
          </div>
        )}

        {summary.loanEligible > 0 && summary.totalScholarships > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 p-4" data-testid="info-loan-coverage">
            <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Loan Coverage Needed
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                After scholarship coverage, you'll need {formatCurrency(summary.loanEligible)} in student loans to cover your tuition.
              </p>
            </div>
          </div>
        )}

        {summary.loanEligible === 0 && summary.totalScholarships > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-950 p-4" data-testid="success-fully-covered">
            <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Fully Covered!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your scholarships cover your full tuition. No student loans needed!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
