import { LandingPage } from '../LandingPage';
import { ThemeProvider } from '../ThemeProvider';

export default function LandingPageExample() {
  return (
    <ThemeProvider>
      <LandingPage onGetStarted={() => console.log('Get started clicked')} />
    </ThemeProvider>
  );
}
