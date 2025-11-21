import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Award, BadgeDollarSign, Landmark, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

interface CostBreakdownProps {
  userId?: string;
}

export function CostBreakdown({ userId }: CostBreakdownProps) {
  const { data: profileData, isLoading: profileLoading } = useQuery<any>({
    queryKey: ['/api/profile'],
  });

  const { data: financialData, isLoading: financialLoading } = useQuery<any>({
    queryKey: ['/api/financial-aid-summary'],
  });

  const isLoading = profileLoading || financialLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Convert string values to numbers (profile stores as strings)
  const tuition = Number(profileData?.tuitionAmount) || 0;
  const housing = Number(profileData?.housingCost) || 0;
  const fees = Number(profileData?.feesCost) || 0;
  const dining = Number(profileData?.diningCost) || 0;
  const books = Number(profileData?.booksCost) || 0;
  const personal = Number(profileData?.personalCost) || 0;
  const transportation = Number(profileData?.transportationCost) || 0;

  const totalCost = tuition + housing + fees + dining + books + personal + transportation;
  const totalScholarships = Number(financialData?.totalScholarships) || 0;
  const grants = Number(profileData?.grantsAmount) || 0;
  const loans = Number(profileData?.loansAmount) || 0;
  const totalFinancialAid = totalScholarships + grants + loans;
  const remainingBalance = totalCost - totalFinancialAid;
  const coveragePercentage = totalCost > 0 ? (totalFinancialAid / totalCost) * 100 : 0;
  const hasSurplus = totalFinancialAid > totalCost && totalCost > 0;


  if (totalCost === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>
            Complete your profile with estimated costs to see your financial breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>No cost information available. Please update your profile with estimated annual costs.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>
            Your estimated annual costs and scholarship coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Cost vs Financial Aid */}
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

          {/* Remaining Balance */}
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

          {/* Coverage Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Financial Aid Coverage</span>
              <span className="font-medium">{Math.min(coveragePercentage, 100).toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(coveragePercentage, 100)} className="h-3" data-testid="progress-coverage" />
            {hasSurplus ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                <Award className="h-4 w-4" />
                Congratulations! Your financial aid exceeds your estimated costs by ${Math.abs(remainingBalance).toLocaleString()}
              </p>
            ) : coveragePercentage >= 100 ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                <Award className="h-4 w-4" />
                Congratulations! Your financial aid covers all estimated costs!
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                You need approximately ${remainingBalance.toLocaleString()} more in financial aid
              </p>
            )}
          </div>

          {/* View Details Button */}
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
  );
}
