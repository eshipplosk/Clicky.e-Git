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
import { DollarSign, Home, BookOpen, Utensils, Bus, User, FileText, Award, ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'wouter';

interface CostCategory {
  name: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
}

export default function FinancialDetails() {
  const { data: profileData, isLoading: profileLoading } = useQuery<any>({
    queryKey: ['/api/profile'],
  });

  const { data: financialData, isLoading: financialLoading } = useQuery<any>({
    queryKey: ['/api/financial-aid-summary'],
  });

  const isLoading = profileLoading || financialLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Convert string values to numbers
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

  if (totalCost === 0) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Link href="/student/dashboard">
          <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Detailed Financial Breakdown</CardTitle>
            <CardDescription>
              Complete your profile with estimated costs to see your financial breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8 text-muted-foreground">
            <p>No cost information available. Please update your profile with estimated annual costs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link href="/student/dashboard">
        <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Detailed Financial Breakdown</h1>
        <p className="text-muted-foreground mt-2">
          Complete breakdown of your estimated annual costs and financial aid
        </p>
      </div>

      <div className="space-y-6">
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
    </div>
  );
}
