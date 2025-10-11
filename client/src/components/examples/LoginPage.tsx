import { LoginPage } from '../LoginPage';
import { ThemeProvider } from '../ThemeProvider';

export default function LoginPageExample() {
  return (
    <ThemeProvider>
      <LoginPage onLogin={(email, password, role) => console.log('Login:', { email, role })} />
    </ThemeProvider>
  );
}
