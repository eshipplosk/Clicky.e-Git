import { AdminDashboard } from '../AdminDashboard';
import { ThemeProvider } from '../ThemeProvider';

export default function AdminDashboardExample() {
  return (
    <ThemeProvider>
      <div className="p-8">
        <AdminDashboard />
      </div>
    </ThemeProvider>
  );
}
