import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import type { ScholarshipApplication } from '@shared/schema';

interface ApplicationWithDetails extends ScholarshipApplication {
  scholarshipTitle?: string;
  requiredDocuments?: string[];
  pendingDocuments?: number;
}

export function PendingFormsReminder() {
  const [, setLocation] = useLocation();

  const { data: applications = [] } = useQuery<ApplicationWithDetails[]>({
    queryKey: ['/api/scholarship-applications'],
  });

  const pendingApplications = applications.filter(app => app.status !== 'declined');

  if (pendingApplications.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 dark:border-orange-900 bg-gradient-to-r from-orange-50 dark:from-orange-950/20 to-orange-50/50 dark:to-orange-950/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <CardTitle className="text-base">Forms to Complete</CardTitle>
          <Badge variant="secondary" className="ml-auto text-orange-700 dark:text-orange-300 bg-orange-200 dark:bg-orange-900/40">
            {pendingApplications.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          You have {pendingApplications.length} scholarship application{pendingApplications.length !== 1 ? 's' : ''} awaiting your attention. Complete the required documents to improve your chances.
        </p>
        <div className="space-y-2">
          {pendingApplications.slice(0, 3).map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-md border border-orange-100 dark:border-orange-900/30"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{app.scholarshipTitle || 'Scholarship Application'}</p>
                  <p className="text-xs text-muted-foreground">Pending documents required</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLocation(`/student/applications/${app.scholarshipId}/details`)}
                data-testid={`button-complete-${app.id}`}
              >
                Complete
              </Button>
            </div>
          ))}
        </div>
        {pendingApplications.length > 3 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            And {pendingApplications.length - 3} more...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
