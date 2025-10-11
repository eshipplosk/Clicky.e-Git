import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStoredProfile } from '../App';

export interface ProfileData {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  
  // Academic
  major: string;
  gpa: string;
  actScore: string;
  satScore: string;
  lsatScore: string;
  greScore: string;
  academicYear: string;
  
  // Demographics
  ethnicity: string;
  gender: string;
  firstGeneration: boolean;
  veteran: boolean;
  disability: boolean;
  
  // Extracurriculars & Skills
  extracurriculars: string[];
  skills: string[];
  volunteerHours: string;
  leadershipRoles: string[];
  
  // Financial
  financialNeed: string;
}

export function EnhancedProfile({ onSave }: { onSave?: (data: ProfileData) => void }) {
  const { toast } = useToast();
  
  // Initialize with empty state
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    major: '',
    gpa: '',
    actScore: '',
    satScore: '',
    lsatScore: '',
    greScore: '',
    academicYear: '',
    ethnicity: '',
    gender: '',
    firstGeneration: false,
    veteran: false,
    disability: false,
    extracurriculars: [],
    skills: [],
    volunteerHours: '',
    leadershipRoles: [],
    financialNeed: ''
  });

  // Load saved profile on mount
  useEffect(() => {
    const savedProfile = getStoredProfile();
    if (savedProfile) {
      setFormData(savedProfile);
      console.log('Loaded saved profile:', savedProfile);
    }
  }, []);

  const [newExtracurricular, setNewExtracurricular] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newLeadership, setNewLeadership] = useState('');

  const addItem = (field: 'extracurriculars' | 'skills' | 'leadershipRoles', value: string, setValue: (v: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const removeItem = (field: 'extracurriculars' | 'skills' | 'leadershipRoles', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
    toast({
      title: "Profile saved!",
      description: "Your profile has been updated successfully.",
    });
    console.log('Profile saved:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-profile-title">Your Profile</h1>
        <p className="text-muted-foreground mt-1">
          Complete your profile to get matched with relevant scholarships
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic details about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                data-testid="input-first-name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                data-testid="input-last-name"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              data-testid="input-email"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
          <CardDescription>Your academic achievements and test scores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="major">Major/Field of Study</Label>
              <Input
                id="major"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder="e.g., Computer Science"
                data-testid="input-major"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select 
                value={formData.academicYear} 
                onValueChange={(v) => setFormData({ ...formData, academicYear: v })}
              >
                <SelectTrigger id="academicYear" data-testid="select-year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freshman">Freshman</SelectItem>
                  <SelectItem value="sophomore">Sophomore</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="graduate">Graduate Student</SelectItem>
                  <SelectItem value="postgrad">Post-Graduate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gpa">GPA (0.00 - 4.00)</Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                placeholder="3.75"
                data-testid="input-gpa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actScore">ACT Score (1-36)</Label>
              <Input
                id="actScore"
                type="number"
                min="1"
                max="36"
                value={formData.actScore}
                onChange={(e) => setFormData({ ...formData, actScore: e.target.value })}
                placeholder="32"
                data-testid="input-act"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="satScore">SAT Score (400-1600)</Label>
              <Input
                id="satScore"
                type="number"
                min="400"
                max="1600"
                value={formData.satScore}
                onChange={(e) => setFormData({ ...formData, satScore: e.target.value })}
                placeholder="1450"
                data-testid="input-sat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lsatScore">LSAT Score (120-180)</Label>
              <Input
                id="lsatScore"
                type="number"
                min="120"
                max="180"
                value={formData.lsatScore}
                onChange={(e) => setFormData({ ...formData, lsatScore: e.target.value })}
                placeholder="165"
                data-testid="input-lsat"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="greScore">GRE Score (260-340)</Label>
            <Input
              id="greScore"
              type="number"
              min="260"
              max="340"
              value={formData.greScore}
              onChange={(e) => setFormData({ ...formData, greScore: e.target.value })}
              placeholder="320"
              data-testid="input-gre"
            />
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
          <CardDescription>Optional information for scholarship matching</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ethnicity">Race/Ethnicity</Label>
              <Select 
                value={formData.ethnicity} 
                onValueChange={(v) => setFormData({ ...formData, ethnicity: v })}
              >
                <SelectTrigger id="ethnicity" data-testid="select-ethnicity">
                  <SelectValue placeholder="Select if applicable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="black">Black or African American</SelectItem>
                  <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                  <SelectItem value="native-american">Native American</SelectItem>
                  <SelectItem value="pacific-islander">Pacific Islander</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="multiracial">Multiracial</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(v) => setFormData({ ...formData, gender: v })}
              >
                <SelectTrigger id="gender" data-testid="select-gender">
                  <SelectValue placeholder="Select if applicable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="firstGen"
                checked={formData.firstGeneration}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, firstGeneration: checked as boolean })
                }
                data-testid="checkbox-first-gen"
              />
              <Label htmlFor="firstGen" className="font-normal cursor-pointer">
                First-generation college student
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="veteran"
                checked={formData.veteran}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, veteran: checked as boolean })
                }
                data-testid="checkbox-veteran"
              />
              <Label htmlFor="veteran" className="font-normal cursor-pointer">
                Veteran or military-affiliated
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disability"
                checked={formData.disability}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, disability: checked as boolean })
                }
                data-testid="checkbox-disability"
              />
              <Label htmlFor="disability" className="font-normal cursor-pointer">
                Student with a disability
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extracurriculars & Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Activities & Skills</CardTitle>
          <CardDescription>Your extracurricular activities and skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Extracurricular Activities</Label>
            <div className="flex gap-2">
              <Input
                value={newExtracurricular}
                onChange={(e) => setNewExtracurricular(e.target.value)}
                placeholder="e.g., Debate Team, Student Government"
                data-testid="input-extracurricular"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('extracurriculars', newExtracurricular, setNewExtracurricular);
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                onClick={() => addItem('extracurriculars', newExtracurricular, setNewExtracurricular)}
                data-testid="button-add-extracurricular"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.extracurriculars.map((item, index) => (
                <Badge key={index} variant="secondary" data-testid={`badge-extracurricular-${index}`}>
                  {item}
                  <button
                    type="button"
                    onClick={() => removeItem('extracurriculars', index)}
                    className="ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Skills & Competencies</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g., Python, Public Speaking, Research"
                data-testid="input-skill"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('skills', newSkill, setNewSkill);
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                onClick={() => addItem('skills', newSkill, setNewSkill)}
                data-testid="button-add-skill"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((item, index) => (
                <Badge key={index} variant="secondary" data-testid={`badge-skill-${index}`}>
                  {item}
                  <button
                    type="button"
                    onClick={() => removeItem('skills', index)}
                    className="ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Leadership Roles</Label>
            <div className="flex gap-2">
              <Input
                value={newLeadership}
                onChange={(e) => setNewLeadership(e.target.value)}
                placeholder="e.g., Team Captain, Club President"
                data-testid="input-leadership"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('leadershipRoles', newLeadership, setNewLeadership);
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                onClick={() => addItem('leadershipRoles', newLeadership, setNewLeadership)}
                data-testid="button-add-leadership"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.leadershipRoles.map((item, index) => (
                <Badge key={index} variant="secondary" data-testid={`badge-leadership-${index}`}>
                  {item}
                  <button
                    type="button"
                    onClick={() => removeItem('leadershipRoles', index)}
                    className="ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volunteerHours">Volunteer Hours (annually)</Label>
            <Input
              id="volunteerHours"
              type="number"
              min="0"
              value={formData.volunteerHours}
              onChange={(e) => setFormData({ ...formData, volunteerHours: e.target.value })}
              placeholder="50"
              data-testid="input-volunteer-hours"
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
          <CardDescription>Help us match you with need-based scholarships</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="financialNeed">Financial Need Level</Label>
            <Select 
              value={formData.financialNeed} 
              onValueChange={(v) => setFormData({ ...formData, financialNeed: v })}
            >
              <SelectTrigger id="financialNeed" data-testid="select-financial-need">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No financial need</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" size="lg" data-testid="button-save-profile">
          Save Profile
        </Button>
      </div>
    </form>
  );
}
