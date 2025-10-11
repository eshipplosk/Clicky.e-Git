import { StudentDashboard } from '../StudentDashboard';
import { ThemeProvider } from '../ThemeProvider';

export default function StudentDashboardExample() {
  return (
    <ThemeProvider>
      <div className="p-8">
        <StudentDashboard studentName="Sarah" profileCompletion={75} matchingScholarships={12} />
      </div>
    </ThemeProvider>
  );
}
