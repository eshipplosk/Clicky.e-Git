import { ScholarshipManagement } from './ScholarshipManagement';
import { UserManagement } from './UserManagement';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <ScholarshipManagement />
        </div>
        <div className="lg:col-span-2">
          <UserManagement />
        </div>
      </div>
    </div>
  );
}
