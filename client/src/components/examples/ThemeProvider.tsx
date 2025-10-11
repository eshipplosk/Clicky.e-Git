import { ThemeProvider } from '../ThemeProvider';
import { useTheme } from '../ThemeProvider';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

function ThemeToggleDemo() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="p-8">
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={toggleTheme}
        data-testid="button-theme-toggle"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>
    </div>
  );
}

export default function ThemeProviderExample() {
  return (
    <ThemeProvider>
      <ThemeToggleDemo />
    </ThemeProvider>
  );
}
