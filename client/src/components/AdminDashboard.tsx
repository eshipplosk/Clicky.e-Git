import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, DollarSign, GraduationCap, TrendingUp } from 'lucide-react';

export function AdminDashboard() {
  // todo: remove mock functionality
  const mockScholarships = [
    { id: '1', name: 'STEM Excellence', amount: 5000, applicants: 45, status: 'active', deadline: '2025-03-15' },
    { id: '2', name: 'Community Service Award', amount: 3000, applicants: 28, status: 'active', deadline: '2025-04-01' },
    { id: '3', name: 'First Generation Grant', amount: 4500, applicants: 62, status: 'active', deadline: '2025-03-30' },
    { id: '4', name: 'Arts & Humanities', amount: 3500, applicants: 19, status: 'draft', deadline: '2025-05-15' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-admin-welcome">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage scholarships and student records</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scholarships</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-scholarships">24</div>
            <p className="text-xs text-muted-foreground mt-1">4 active programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-students">1,234</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-funding">$485,000</div>
            <p className="text-xs text-muted-foreground mt-1">Available this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-applications">154</div>
            <p className="text-xs text-muted-foreground mt-1">Pending review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Scholarship Programs</CardTitle>
            <Button data-testid="button-add-scholarship">
              <Plus className="h-4 w-4 mr-2" />
              Add Scholarship
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scholarships..."
                className="pl-9"
                data-testid="input-search-scholarships"
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockScholarships.map((scholarship) => (
                  <TableRow key={scholarship.id} data-testid={`row-scholarship-${scholarship.id}`}>
                    <TableCell className="font-medium" data-testid={`text-name-${scholarship.id}`}>
                      {scholarship.name}
                    </TableCell>
                    <TableCell data-testid={`text-amount-${scholarship.id}`}>
                      ${scholarship.amount.toLocaleString()}
                    </TableCell>
                    <TableCell data-testid={`text-applicants-${scholarship.id}`}>
                      {scholarship.applicants}
                    </TableCell>
                    <TableCell data-testid={`text-deadline-${scholarship.id}`}>
                      {new Date(scholarship.deadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={scholarship.status === 'active' ? 'default' : 'secondary'}
                        data-testid={`badge-status-${scholarship.id}`}
                      >
                        {scholarship.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`button-edit-${scholarship.id}`}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
