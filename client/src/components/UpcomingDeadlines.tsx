import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { Clock } from 'lucide-react';
import type { Scholarship } from '@shared/schema';

interface UpcomingDeadlinesProps {
  scholarships: Scholarship[];
  days?: number;
  limit?: number;
}

export function UpcomingDeadlines({ scholarships = [], days = 30, limit = 5 }: UpcomingDeadlinesProps) {
  const now = new Date();
  const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const upcoming = scholarships
    .filter(s => {
      try {
        const d = new Date(s.deadline);
        return d >= now && d <= cutoff;
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const count = upcoming.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold" data-testid="text-deadlines-count">{count}</div>
          <div className="text-xs text-muted-foreground">Next {days} days</div>
        </div>

        <div className="mt-3 space-y-2">
          {count === 0 ? (
            <div className="text-sm text-muted-foreground">No upcoming deadlines in the next {days} days.</div>
          ) : (
            upcoming.slice(0, limit).map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <Link href={`/student/scholarships`}>
                  <a className="text-sm font-medium hover:underline">{s.title}</a>
                </Link>
                <div className="text-xs text-muted-foreground">
                  {new Date(s.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default UpcomingDeadlines;
