import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
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
import AIAssistantPage from "@/pages/ai-assistant";
import ScholarshipApplicationDetails from "@/pages/ScholarshipApplicationDetails";
import NotFound from "@/pages/not-found";

// Create a global profile store using localStorage
const PROFILE_STORAGE_KEY = 'scholarHub_userProfile';

export function getStoredProfile(): ProfileData | undefined {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : undefined;
  } catch {
    return undefined;
  }
}

export function setStoredProfile(profile: ProfileData) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  // Trigger storage event for cross-component updates
  window.dispatchEvent(new Event('profileUpdated'));
}

interface User {
  id: string;
  username: string;
  role: 'student' | 'admin';
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

function Router() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setUser(data);
          // Redirect to appropriate dashboard if logged in
          const path = window.location.pathname;
          if (path === '/' || path === '/login') {
            setLocation(data.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [setLocation]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    if (userData.role === 'student') {
      setLocation('/student/dashboard');
    } else {
      setLocation('/admin/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Logout failed:', response.status, response.statusText);
        return;
      }
      
      setUser(null);
      queryClient.clear();
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleGetStarted = () => {
    setLocation('/login');
  };

  const handleProfileSave = (data: ProfileData) => {
    setStoredProfile(data);
    console.log('Profile saved in App.tsx:', data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {user && <Header userRole={user.role} userName={user.firstName || user.username} onLogout={handleLogout} />}
      
      <main className="flex-1">
        <Switch>
          <Route path="/" component={() => <LandingPage onGetStarted={handleGetStarted} />} />
          <Route path="/login" component={() => <LoginPage onLogin={handleLogin} />} />
          <Route path="/student/dashboard">
            {user ? (
              <div className="container mx-auto p-6">
                <StudentDashboard studentName={user.firstName || user.username} />
              </div>
            ) : (
              <div className="container mx-auto p-6 text-center">
                <p>Please log in to access this page</p>
              </div>
            )}
          </Route>
          <Route path="/student/scholarships">
            {user ? (
              <div className="container mx-auto p-6">
                <FilteredScholarshipList />
              </div>
            ) : (
              <div className="container mx-auto p-6 text-center">
                <p>Please log in to access this page</p>
              </div>
            )}
          </Route>
          <Route path="/student/profile">
            {user ? (
              <div className="container mx-auto p-6">
                <EnhancedProfile onSave={handleProfileSave} />
              </div>
            ) : (
              <div className="container mx-auto p-6 text-center">
                <p>Please log in to access this page</p>
              </div>
            )}
          </Route>
          <Route path="/student/ai-assistant">
            {user ? (
              <AIAssistantPage />
            ) : (
              <div className="container mx-auto p-6 text-center">
                <p>Please log in to access this page</p>
              </div>
            )}
          </Route>
          <Route path="/student/applications/:scholarshipId/details">
            {user ? (
              <ScholarshipApplicationDetails />
            ) : (
              <div className="container mx-auto p-6 text-center">
                <p>Please log in to access this page</p>
              </div>
            )}
          </Route>
          <Route path="/admin/dashboard">
            {user?.role === 'admin' ? (
              <div className="container mx-auto p-6">
                <AdminDashboard />
              </div>
            ) : (
              <div className="container mx-auto p-6 text-center">
                <p>Admin access required</p>
              </div>
            )}
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
