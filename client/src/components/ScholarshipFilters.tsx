import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface FilterCriteria {
  minAmount?: number;
  maxAmount?: number;
  categories?: string[];
  minGPA?: number;
  minACT?: number;
  minSAT?: number;
  ethnicity?: string[];
  firstGen?: boolean;
  veteran?: boolean;
  disability?: boolean;
  requiresEssay?: boolean;
  deadlineRange?: string;
}

interface ScholarshipFiltersProps {
  onFilterChange: (filters: FilterCriteria) => void;
}

export function ScholarshipFilters({ onFilterChange }: ScholarshipFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({});

  const categories = ['STEM', 'Arts', 'Business', 'Community Service', 'Athletics', 'Financial Aid'];
  const ethnicities = ['Asian', 'Black or African American', 'Hispanic or Latino', 'Native American', 'Pacific Islander', 'White', 'Multiracial'];

  const toggleCategory = (category: string) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updateFilters({ categories: updated });
  };

  const toggleEthnicity = (ethnicity: string) => {
    const current = filters.ethnicity || [];
    const updated = current.includes(ethnicity)
      ? current.filter(e => e !== ethnicity)
      : [...current, ethnicity];
    updateFilters({ ethnicity: updated });
  };

  const updateFilters = (updates: Partial<FilterCriteria>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof FilterCriteria];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  }).length;

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto"
        data-testid="button-toggle-filters"
      >
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        Advanced Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
        )}
      </Button>

      {isOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-lg">Filter Scholarships</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              Clear All
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Range */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Award Amount</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minAmount" className="text-sm">Minimum ($)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    min="0"
                    value={filters.minAmount || ''}
                    onChange={(e) => updateFilters({ minAmount: Number(e.target.value) || undefined })}
                    placeholder="1000"
                    data-testid="input-min-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount" className="text-sm">Maximum ($)</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    min="0"
                    value={filters.maxAmount || ''}
                    onChange={(e) => updateFilters({ maxAmount: Number(e.target.value) || undefined })}
                    placeholder="10000"
                    data-testid="input-max-amount"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={filters.categories?.includes(category) ? "default" : "outline"}
                    className="cursor-pointer hover-elevate"
                    onClick={() => toggleCategory(category)}
                    data-testid={`badge-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Academic Requirements */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Academic Requirements</Label>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="minGPA" className="text-sm">Min GPA</Label>
                  <Input
                    id="minGPA"
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    value={filters.minGPA || ''}
                    onChange={(e) => updateFilters({ minGPA: Number(e.target.value) || undefined })}
                    placeholder="3.0"
                    data-testid="input-min-gpa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minACT" className="text-sm">Min ACT</Label>
                  <Input
                    id="minACT"
                    type="number"
                    min="1"
                    max="36"
                    value={filters.minACT || ''}
                    onChange={(e) => updateFilters({ minACT: Number(e.target.value) || undefined })}
                    placeholder="25"
                    data-testid="input-min-act"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minSAT" className="text-sm">Min SAT</Label>
                  <Input
                    id="minSAT"
                    type="number"
                    min="400"
                    max="1600"
                    value={filters.minSAT || ''}
                    onChange={(e) => updateFilters({ minSAT: Number(e.target.value) || undefined })}
                    placeholder="1200"
                    data-testid="input-min-sat"
                  />
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Demographics</Label>
              <div className="flex flex-wrap gap-2">
                {ethnicities.map((ethnicity) => (
                  <Badge
                    key={ethnicity}
                    variant={filters.ethnicity?.includes(ethnicity) ? "default" : "outline"}
                    className="cursor-pointer hover-elevate"
                    onClick={() => toggleEthnicity(ethnicity)}
                    data-testid={`badge-ethnicity-${ethnicity.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {ethnicity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Special Categories */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Special Categories</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="firstGen"
                    checked={filters.firstGen || false}
                    onCheckedChange={(checked) => updateFilters({ firstGen: checked as boolean })}
                    data-testid="checkbox-first-gen"
                  />
                  <Label htmlFor="firstGen" className="font-normal cursor-pointer">
                    First-generation college student
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="veteran"
                    checked={filters.veteran || false}
                    onCheckedChange={(checked) => updateFilters({ veteran: checked as boolean })}
                    data-testid="checkbox-veteran"
                  />
                  <Label htmlFor="veteran" className="font-normal cursor-pointer">
                    Veteran or military-affiliated
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="disability"
                    checked={filters.disability || false}
                    onCheckedChange={(checked) => updateFilters({ disability: checked as boolean })}
                    data-testid="checkbox-disability"
                  />
                  <Label htmlFor="disability" className="font-normal cursor-pointer">
                    Student with disability
                  </Label>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Deadline</Label>
              <Select 
                value={filters.deadlineRange || ''} 
                onValueChange={(v) => updateFilters({ deadlineRange: v })}
              >
                <SelectTrigger data-testid="select-deadline">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Next 7 days</SelectItem>
                  <SelectItem value="30">Next 30 days</SelectItem>
                  <SelectItem value="60">Next 60 days</SelectItem>
                  <SelectItem value="90">Next 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
