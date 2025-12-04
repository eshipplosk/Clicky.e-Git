import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScholarshipCard } from './ScholarshipCard';
import { ScholarshipFilters, FilterCriteria } from './ScholarshipFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ProfileData } from './EnhancedProfile';
import { getStoredProfile } from '../App';

interface Scholarship {
  id: string;
  title: string;
  amount: number;
  deadline: string;
  category: string;
  eligibility: string;
  description: string;
  requirements: {
    minGPA?: number;
    minACT?: number;
    minSAT?: number;
    ethnicity?: string[];
    firstGen?: boolean;
    veteran?: boolean;
    disability?: boolean;
    major?: string[];
    skills?: string[];
  };
}

export function FilteredScholarshipList() {
  const [userProfile, setUserProfile] = useState<ProfileData | undefined>(getStoredProfile());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterCriteria>({});

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      setUserProfile(getStoredProfile());
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  // Fetch scholarships from database
  const { data: scholarships = [], isLoading } = useQuery<Scholarship[]>({
    queryKey: ['/api/scholarships'],
  });

  // Mock scholarships for fallback (will be removed once DB is populated)
  const mockScholarships: Scholarship[] = [
    {
      id: '1',
      title: 'STEM Excellence Scholarship',
      amount: 5000,
      deadline: '2025-03-15',
      category: 'STEM',
      eligibility: 'GPA 3.5+, STEM major',
      description: 'Supporting outstanding students pursuing degrees in Science, Technology, Engineering, and Mathematics.',
      requirements: {
        minGPA: 3.5,
        major: ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Biology']
      }
    },
    {
      id: '2',
      title: 'First Generation Achievement Award',
      amount: 4500,
      deadline: '2025-03-30',
      category: 'Financial Aid',
      eligibility: 'First-gen college student',
      description: 'Supporting first-generation college students in achieving their educational goals.',
      requirements: {
        firstGen: true,
        minGPA: 2.5
      }
    },
    {
      id: '3',
      title: 'Women in Technology Grant',
      amount: 6000,
      deadline: '2025-03-25',
      category: 'STEM',
      eligibility: 'Female CS/Engineering major, GPA 3.0+',
      description: 'Empowering women pursuing careers in technology and engineering fields.',
      requirements: {
        minGPA: 3.0,
        major: ['Computer Science', 'Engineering', 'Information Technology']
      }
    },
    {
      id: '4',
      title: 'Hispanic Heritage Scholarship',
      amount: 3500,
      deadline: '2025-04-15',
      category: 'Community',
      eligibility: 'Hispanic or Latino students',
      description: 'Celebrating Hispanic heritage and supporting Latino students in higher education.',
      requirements: {
        ethnicity: ['Hispanic or Latino'],
        minGPA: 2.8
      }
    },
    {
      id: '5',
      title: 'Veterans Education Fund',
      amount: 7500,
      deadline: '2025-05-01',
      category: 'Financial Aid',
      eligibility: 'Military veterans or active duty',
      description: 'Supporting those who served our country in pursuing higher education.',
      requirements: {
        veteran: true
      }
    },
    {
      id: '6',
      title: 'High Achiever ACT Scholarship',
      amount: 4000,
      deadline: '2025-04-10',
      category: 'Financial Aid',
      eligibility: 'ACT score 30+',
      description: 'Recognizing academic excellence through standardized test achievement.',
      requirements: {
        minACT: 30
      }
    },
    {
      id: '7',
      title: 'Community Service Leadership Award',
      amount: 3000,
      deadline: '2025-04-01',
      category: 'Community Service',
      eligibility: '100+ volunteer hours',
      description: 'Recognizing students who demonstrate exceptional commitment to community service.',
      requirements: {
        minGPA: 3.0
      }
    },
    {
      id: '8',
      title: 'Disability Awareness Scholarship',
      amount: 5000,
      deadline: '2025-03-20',
      category: 'Financial Aid',
      eligibility: 'Students with disabilities',
      description: 'Supporting students with disabilities in achieving their academic dreams.',
      requirements: {
        disability: true,
        minGPA: 2.5
      }
    },
    {
      id: '9',
      title: 'SAT Excellence Award',
      amount: 3500,
      deadline: '2025-04-05',
      category: 'Financial Aid',
      eligibility: 'SAT score 1400+',
      description: 'Rewarding exceptional SAT performance and academic potential.',
      requirements: {
        minSAT: 1400
      }
    },
    {
      id: '10',
      title: 'Arts & Humanities Scholarship',
      amount: 3000,
      deadline: '2025-05-15',
      category: 'Arts',
      eligibility: 'Art or Humanities major, GPA 3.2+',
      description: 'Empowering students pursuing creative and humanistic disciplines.',
      requirements: {
        minGPA: 3.2,
        major: ['Art', 'Music', 'Theater', 'Literature', 'History', 'Philosophy']
      }
    }
  ];

  const calculateMatchScore = (scholarship: Scholarship): number => {
    if (!userProfile) return 0;
    
    let score = 0;
    let criteria = 0;

    // GPA match
    if (scholarship.requirements.minGPA) {
      criteria++;
      const userGPA = parseFloat(userProfile.gpa);
      if (!isNaN(userGPA) && userGPA >= scholarship.requirements.minGPA) {
        score++;
      }
    }

    // ACT match
    if (scholarship.requirements.minACT) {
      criteria++;
      const userACT = parseInt(userProfile.actScore);
      if (!isNaN(userACT) && userACT >= scholarship.requirements.minACT) {
        score++;
      }
    }

    // SAT match
    if (scholarship.requirements.minSAT) {
      criteria++;
      const userSAT = parseInt(userProfile.satScore);
      if (!isNaN(userSAT) && userSAT >= scholarship.requirements.minSAT) {
        score++;
      }
    }

    // Ethnicity match
    if (scholarship.requirements.ethnicity && scholarship.requirements.ethnicity.length > 0) {
      criteria++;
      if (scholarship.requirements.ethnicity.some(e => 
        e.toLowerCase() === userProfile.ethnicity?.toLowerCase()
      )) {
        score++;
      }
    }

    // First gen match
    if (scholarship.requirements.firstGen !== undefined) {
      criteria++;
      if (scholarship.requirements.firstGen === userProfile.firstGeneration) {
        score++;
      }
    }

    // Veteran match
    if (scholarship.requirements.veteran !== undefined) {
      criteria++;
      if (scholarship.requirements.veteran === userProfile.veteran) {
        score++;
      }
    }

    // Disability match
    if (scholarship.requirements.disability !== undefined) {
      criteria++;
      if (scholarship.requirements.disability === userProfile.disability) {
        score++;
      }
    }

    // Major match
    if (scholarship.requirements.major && scholarship.requirements.major.length > 0) {
      criteria++;
      if (scholarship.requirements.major.some(m => 
        userProfile.major?.toLowerCase().includes(m.toLowerCase())
      )) {
        score++;
      }
    }

    return criteria > 0 ? Math.round((score / criteria) * 100) : 50;
  };

  // Normalize API scholarships to have a requirements object like mock data
  const normalizedScholarships = useMemo(() => {
    return scholarships.map((s: any) => ({
      id: s.id,
      title: s.title,
      amount: s.amount,
      deadline: s.deadline,
      category: s.category,
      eligibility: s.eligibility,
      description: s.description,
      requirements: s.requirements || {
        minGPA: s.minGPA,
        minACT: s.minACT,
        minSAT: s.minSAT,
        minLSAT: s.minLSAT,
        minGRE: s.minGRE,
        ethnicity: s.ethnicityRequirements,
        firstGen: s.requiresFirstGen,
        veteran: s.requiresVeteran,
        disability: s.requiresDisability,
        major: s.majorRequirements,
        skills: s.skillRequirements,
      }
    }));
  }, [scholarships]);

  // Use real scholarships if available, otherwise fallback to mock
  const displayScholarships = normalizedScholarships.length > 0 ? normalizedScholarships : mockScholarships;

  const filteredScholarships = useMemo(() => {
    console.log('FilteredScholarshipList - userProfile:', userProfile);
    return displayScholarships.filter(scholarship => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          scholarship.title.toLowerCase().includes(query) ||
          scholarship.description.toLowerCase().includes(query) ||
          scholarship.category.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Amount filters
      if (filters.minAmount && scholarship.amount < filters.minAmount) return false;
      if (filters.maxAmount && scholarship.amount > filters.maxAmount) return false;

      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(scholarship.category)) return false;
      }

      // Academic filters
      if (filters.minGPA && scholarship.requirements.minGPA && scholarship.requirements.minGPA < filters.minGPA) {
        return false;
      }
      if (filters.minACT && scholarship.requirements.minACT && scholarship.requirements.minACT < filters.minACT) {
        return false;
      }
      if (filters.minSAT && scholarship.requirements.minSAT && scholarship.requirements.minSAT < filters.minSAT) {
        return false;
      }

      // Demographics filters
      if (filters.ethnicity && filters.ethnicity.length > 0) {
        if (!scholarship.requirements.ethnicity || 
            !scholarship.requirements.ethnicity.some((e: string) => filters.ethnicity!.includes(e))) {
          return false;
        }
      }

      if (filters.firstGen && !scholarship.requirements.firstGen) return false;
      if (filters.veteran && !scholarship.requirements.veteran) return false;
      if (filters.disability && !scholarship.requirements.disability) return false;

      // Deadline filter
      if (filters.deadlineRange) {
        const deadlineDate = new Date(scholarship.deadline);
        const today = new Date();
        const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const range = parseInt(filters.deadlineRange);
        if (daysUntil > range) return false;
      }

      return true;
    }).map(scholarship => ({
      ...scholarship,
      matchScore: calculateMatchScore(scholarship)
    })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [searchQuery, filters, userProfile]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Find Your Scholarships</h1>
        <p className="text-muted-foreground mt-1">
          {userProfile 
            ? `Showing ${filteredScholarships.length} scholarships matched to your profile` 
            : 'Complete your profile for personalized matches'}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scholarships..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
        </div>
        
        <ScholarshipFilters onFilterChange={setFilters} />
      </div>

      {!userProfile && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm">
            <strong>Tip:</strong> Complete your profile to see personalized match scores and get better scholarship recommendations!
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredScholarships.map((scholarship) => {
          console.log(`Scholarship ${scholarship.id} - matchScore:`, scholarship.matchScore);
          return (
            <ScholarshipCard
              key={scholarship.id}
              {...scholarship}
              matchScore={scholarship.matchScore}
              onClick={() => console.log('Scholarship clicked:', scholarship.id)}
            />
          );
        })}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No scholarships found matching your criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('');
              setFilters({});
            }}
            data-testid="button-clear-all"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
