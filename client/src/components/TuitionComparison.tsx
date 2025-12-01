import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const arkansasUniversities = [
  { name: 'University of Arkansas', tuition: 11400 },
  { name: 'Arkansas State University', tuition: 9800 },
  { name: 'Hendrix College', tuition: 54000 },
  { name: 'Harding University', tuition: 30500 },
  { name: 'Ouachita Baptist University', tuition: 35000 },
  { name: 'University of Central Arkansas', tuition: 10200 },
  { name: 'John Brown University', tuition: 40000 },
];

interface TuitionComparisonProps {
  userTuition?: number;
}

export function TuitionComparison({ userTuition = 0 }: TuitionComparisonProps) {
  // Prepare chart data
  const chartData = [
    ...arkansasUniversities.map(uni => ({
      name: uni.name.split(' ').slice(0, 2).join(' '),
      tuition: uni.tuition,
      isUser: false,
    })),
    ...(userTuition > 0 ? [{
      name: 'Your Tuition',
      tuition: userTuition,
      isUser: true,
    }] : []),
  ];

  const averageArkansas = Math.round(
    arkansasUniversities.reduce((sum, uni) => sum + uni.tuition, 0) / arkansasUniversities.length
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Tuition Comparison</CardTitle>
              <CardDescription>
                How your tuition compares to Arkansas universities
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Average Arkansas Tuition</p>
            <p className="text-2xl font-bold" data-testid="text-avg-tuition">
              ${averageArkansas.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Lowest Tuition</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${Math.min(...arkansasUniversities.map(u => u.tuition)).toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Highest Tuition</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ${Math.max(...arkansasUniversities.map(u => u.tuition)).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Comparison Chart */}
        <div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
              />
              <YAxis 
                label={{ value: 'Annual Tuition ($)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => `$${Number(value).toLocaleString()}`}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar 
                dataKey="tuition" 
                fill="hsl(var(--chart-1))"
                name="Tuition Cost"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* University List */}
        <div>
          <h3 className="font-semibold mb-4">Arkansas Universities</h3>
          <div className="space-y-3">
            {arkansasUniversities.map((uni, index) => {
              const comparison = userTuition > 0 ? userTuition - uni.tuition : 0;
              const isHigher = comparison > 0;
              const isLower = comparison < 0;

              return (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-card rounded-md border border-border hover-elevate"
                  data-testid={`university-item-${index}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{uni.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Annual tuition
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-lg">${uni.tuition.toLocaleString()}</p>
                    {userTuition > 0 && (
                      <div className="text-right">
                        {isHigher && (
                          <Badge variant="outline" className="text-orange-600 dark:text-orange-400">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +${comparison.toLocaleString()}
                          </Badge>
                        )}
                        {isLower && (
                          <Badge variant="outline" className="text-green-600 dark:text-green-400">
                            <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                            -${Math.abs(comparison).toLocaleString()}
                          </Badge>
                        )}
                        {comparison === 0 && (
                          <Badge variant="outline">Same</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="bg-muted/50 p-4 rounded-md">
          <p className="text-sm text-muted-foreground">
            These figures represent estimated annual tuition costs for in-state students. Actual costs may vary based on program, enrollment status, and current year rates. Contact universities directly for the most current information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
