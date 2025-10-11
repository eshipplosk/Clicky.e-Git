import { useState } from 'react';
import { ScholarshipCard } from './ScholarshipCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ScholarshipList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  // todo: remove mock functionality
  const mockScholarships = [
    {
      id: '1',
      title: 'STEM Excellence Scholarship',
      amount: 5000,
      deadline: 'March 15, 2025',
      category: 'STEM',
      eligibility: 'GPA 3.5+ in STEM major',
      matchScore: 92,
      description: 'Supporting outstanding students pursuing degrees in Science, Technology, Engineering, and Mathematics.'
    },
    {
      id: '2',
      title: 'Community Service Award',
      amount: 3000,
      deadline: 'April 1, 2025',
      category: 'Community',
      eligibility: '50+ volunteer hours',
      matchScore: 85,
      description: 'Recognizing students who demonstrate exceptional commitment to community service and leadership.'
    },
    {
      id: '3',
      title: 'First Generation College Grant',
      amount: 4500,
      deadline: 'March 30, 2025',
      category: 'Financial Aid',
      eligibility: 'First-gen college student',
      matchScore: 78,
      description: 'Supporting first-generation college students in achieving their educational goals.'
    },
    {
      id: '4',
      title: 'Arts & Humanities Scholarship',
      amount: 3500,
      deadline: 'May 15, 2025',
      category: 'Arts',
      eligibility: 'Art or Humanities major',
      matchScore: 65,
      description: 'Empowering students pursuing creative and humanistic disciplines.'
    },
    {
      id: '5',
      title: 'Athletic Achievement Award',
      amount: 4000,
      deadline: 'April 20, 2025',
      category: 'Athletics',
      eligibility: 'Varsity athlete',
      matchScore: 58,
      description: 'Celebrating student-athletes who excel both on the field and in the classroom.'
    },
    {
      id: '6',
      title: 'Women in Technology Grant',
      amount: 6000,
      deadline: 'March 25, 2025',
      category: 'STEM',
      eligibility: 'Female CS/Engineering major',
      matchScore: 88,
      description: 'Supporting women pursuing careers in technology and engineering fields.'
    }
  ];

  const categories = ['all', 'STEM', 'Community', 'Financial Aid', 'Arts', 'Athletics'];

  const filteredScholarships = mockScholarships.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || s.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Browse Scholarships</h1>
        <p className="text-muted-foreground mt-1">Discover opportunities that match your profile</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
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
        
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" data-testid="button-filters">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Quick filters:</span>
        <Badge variant="outline" className="cursor-pointer hover-elevate" data-testid="badge-high-match">
          High Match (80%+)
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover-elevate" data-testid="badge-deadline-soon">
          Deadline Soon
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover-elevate" data-testid="badge-high-amount">
          High Amount ($5K+)
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredScholarships.map((scholarship) => (
          <ScholarshipCard
            key={scholarship.id}
            {...scholarship}
            onClick={() => console.log('Scholarship clicked:', scholarship.id)}
          />
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No scholarships found matching your criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setCategory('all');
            }}
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
