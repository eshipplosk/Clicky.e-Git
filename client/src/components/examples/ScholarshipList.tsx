import { ScholarshipList } from '../ScholarshipList';
import { ThemeProvider } from '../ThemeProvider';

export default function ScholarshipListExample() {
  return (
    <ThemeProvider>
      <div className="p-8">
        <ScholarshipList />
      </div>
    </ThemeProvider>
  );
}
