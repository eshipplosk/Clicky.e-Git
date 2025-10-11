import { ProfileSetup } from '../ProfileSetup';
import { ThemeProvider } from '../ThemeProvider';

export default function ProfileSetupExample() {
  return (
    <ThemeProvider>
      <div className="p-8">
        <ProfileSetup />
      </div>
    </ThemeProvider>
  );
}
