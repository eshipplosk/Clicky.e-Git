import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Search, Award, TrendingUp, Users, Shield } from 'lucide-react';
import logoImage from '@assets/Mesa_de_trabajo_1_1764790875988.png';

interface LandingPageProps {
  onGetStarted?: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Search,
      title: 'Smart Matching',
      description: 'Our algorithm matches you with scholarships based on your unique profile and qualifications.'
    },
    {
      icon: Award,
      title: 'Thousands of Scholarships',
      description: 'Access a comprehensive database of scholarships from universities, organizations, and foundations.'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor application deadlines, track your submissions, and measure your success rate.'
    },
    {
      icon: Users,
      title: 'Student Community',
      description: 'Connect with other scholarship seekers and share tips for successful applications.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your personal information is protected with bank-level security and encryption.'
    },
    {
      icon: GraduationCap,
      title: 'Expert Guidance',
      description: 'Access resources, tips, and guidance to craft winning scholarship applications.'
    }
  ];

  const stats = [
    { value: '$2.5M+', label: 'Scholarships Awarded' },
    { value: '10,000+', label: 'Active Students' },
    { value: '500+', label: 'Partner Organizations' },
    { value: '95%', label: 'Success Rate' }
  ];

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex justify-center mb-4">
              <img src={logoImage} alt="Clicky.e" className="h-16" style={{ width: 'auto' }} />
            </div>
            <Badge className="mx-auto" style={{ backgroundColor: 'hsl(var(--brand-yellow))', color: '#000' }} data-testid="badge-hero">
              Scholarship Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight" data-testid="text-hero-title">
              Find Your Path to <span className="text-primary">Scholarship Success</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-description">
              Discover personalized scholarship opportunities and unlock your potential. 
              Join thousands of students who have secured funding for their education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                data-testid="button-get-started"
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-features-title">
            Everything You Need to Succeed
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform provides all the tools and resources you need to find and apply for scholarships.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover-elevate transition-all" data-testid={`feature-card-${index}`}>
                <CardHeader>
                  <div className="mb-2">
                    <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: 'hsl(var(--brand-yellow) / 0.15)' }}>
                      <Icon className="h-6 w-6" style={{ color: 'hsl(var(--brand-yellow))' }} />
                    </div>
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-cta-title">
                    Ready to Start Your Scholarship Journey?
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Create your free account today and get matched with scholarships tailored to your profile.
                  </p>
                  <div className="pt-4">
                    <Button 
                      size="lg" 
                      onClick={onGetStarted}
                      data-testid="button-cta"
                    >
                      Create Free Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p data-testid="text-footer">© 2025 Clicky.e. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
