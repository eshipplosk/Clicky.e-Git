import { Header } from '../Header';
import { ThemeProvider } from '../ThemeProvider';

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <Header userRole="student" userName="Sarah Johnson" />
    </ThemeProvider>
  );
}
