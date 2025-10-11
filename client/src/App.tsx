import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { LandingPage } from "@/components/LandingPage";
import { LoginPage } from "@/components/LoginPage";
import { StudentDashboard } from "@/components/StudentDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { EnhancedProfile, ProfileData } from "@/components/EnhancedProfile";
import { FilteredScholarshipList } from "@/components/FilteredScholarshipList";
import NotFound from "@/pages/not-found";

function Router() {
  const [, setLocation] = useLocation();
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileData | undefined>(undefined);

  const handleLogin = (email: string, password: string, role: 'student' | 'admin') => {
    console.log('Login:', { email, role });
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === 'student') {
      setLocation('/student/dashboard');
    } else {
      setLocation('/admin/dashboard');
    }
  };

  const handleGetStarted = () => {
    setLocation('/login');
  };

  const handleProfileSave = (data: ProfileData) => {
    setUserProfile(data);
    console.log('Profile saved:', data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && <Header userRole={userRole || 'student'} />}
      
      <main className="flex-1">
        <Switch>
          <Route path="/" component={() => <LandingPage onGetStarted={handleGetStarted} />} />
          <Route path="/login" component={() => <LoginPage onLogin={handleLogin} />} />
          <Route path="/student/dashboard">
            <div className="container mx-auto p-6">
              <StudentDashboard />
            </div>
          </Route>
          <Route path="/student/scholarships">
            <div className="container mx-auto p-6">
              <FilteredScholarshipList userProfile={userProfile} />
            </div>
          </Route>
          <Route path="/student/profile">
            <div className="container mx-auto p-6">
              <EnhancedProfile onSave={handleProfileSave} />
            </div>
          </Route>
          <Route path="/admin/dashboard">
            <div className="container mx-auto p-6">
              <AdminDashboard />
            </div>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Router />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
