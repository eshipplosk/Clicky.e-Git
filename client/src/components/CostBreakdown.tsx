import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Home, BookOpen, Utensils, Bus, User, FileText, TrendingUp, TrendingDown, Award, BadgeDollarSign, Landmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CostBreakdownProps {
  userId?: string;
}

interface CostCategory {
  name: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
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

  const tuition = profileData?.tuitionAmount || 0;
  const housing = profileData?.housingCost || 0;
  const fees = profileData?.feesCost || 0;
  const dining = profileData?.diningCost || 0;
  const books = profileData?.booksCost || 0;
  const personal = profileData?.personalCost || 0;
  const transportation = profileData?.transportationCost || 0;

  const totalCost = tuition + housing + fees + dining + books + personal + transportation;
  const totalScholarships = financialData?.totalScholarships || 0;
  const grants = profileData?.grantsAmount || 0;
  const loans = profileData?.loansAmount || 0;
  const totalFinancialAid = totalScholarships + grants + loans;
  const remainingBalance = totalCost - totalFinancialAid;
  const coveragePercentage = totalCost > 0 ? (totalFinancialAid / totalCost) * 100 : 0;
  const hasSurplus = totalFinancialAid > totalCost && totalCost > 0;

  const costCategories: CostCategory[] = [
    {
      name: 'Tuition & Fees',
      amount: tuition,
      icon: <FileText className="h-5 w-5" />,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      name: 'Housing (Room & Board)',
      amount: housing,
      icon: <Home className="h-5 w-5" />,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      name: 'Student Fees',
      amount: fees,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      name: 'Meal Plan / Dining',
      amount: dining,
      icon: <Utensils className="h-5 w-5" />,
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      name: 'Books & Supplies',
      amount: books,
      icon: <BookOpen className="h-5 w-5" />,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      name: 'Personal Expenses',
      amount: personal,
      icon: <User className="h-5 w-5" />,
      color: 'text-pink-600 dark:text-pink-400',
    },
    {
      name: 'Transportation',
      amount: transportation,
      icon: <Bus className="h-5 w-5" />,
      color: 'text-teal-600 dark:text-teal-400',
    },
  ].filter(category => category.amount > 0);

  if (totalCost === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
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

  // Prepare chart data
  const chartData = [
    { name: 'Tuition & Fees', value: tuition, color: 'hsl(var(--chart-1))' },
    { name: 'Housing', value: housing, color: 'hsl(var(--chart-2))' },
    { name: 'Student Fees', value: fees, color: 'hsl(var(--chart-3))' },
    { name: 'Dining', value: dining, color: 'hsl(var(--chart-4))' },
    { name: 'Books', value: books, color: 'hsl(var(--chart-5))' },
    { name: 'Personal', value: personal, color: 'hsl(var(--primary))' },
    { name: 'Transportation', value: transportation, color: 'hsl(var(--secondary))' },
  ].filter(item => item.value > 0);

  const financialAidData = [
    { name: 'Scholarships', value: totalScholarships, color: 'hsl(var(--chart-1))' },
    { name: 'Grants & Aid', value: grants, color: 'hsl(var(--chart-2))' },
    { name: 'Loans', value: loans, color: 'hsl(var(--chart-3))' },
    { name: 'Remaining Balance', value: Math.max(0, remainingBalance), color: 'hsl(var(--muted))' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
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
        </CardContent>
      </Card>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>
              Where your money goes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Financial Aid Sources Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Aid Sources</CardTitle>
            <CardDescription>
              How your costs are covered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financialAidData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financialAidData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of your estimated annual expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {costCategories.map((category, index) => {
            const percentage = (category.amount / totalCost) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={category.color}>{category.icon}</div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="font-semibold">${category.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={percentage} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between font-bold text-lg">
              <span>Total Annual Cost</span>
              <span data-testid="text-breakdown-total">${totalCost.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financing Options */}
      {remainingBalance > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>How to Cover Remaining Costs</CardTitle>
            <CardDescription>
              Options to cover your ${remainingBalance.toLocaleString()} remaining balance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Apply for More Scholarships</p>
                <p className="text-sm text-muted-foreground">
                  Browse available scholarships to find additional funding opportunities
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Federal Student Loans</p>
                <p className="text-sm text-muted-foreground">
                  Complete FAFSA to access federal student loan programs
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Work-Study Programs</p>
                <p className="text-sm text-muted-foreground">
                  Part-time campus employment to help cover expenses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
