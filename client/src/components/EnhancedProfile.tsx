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
import { X, Plus, Loader2, Edit, Eye, Camera, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStoredProfile, setStoredProfile } from '../App';
import { apiRequest } from '@/lib/queryClient';
import { ProfileCompletionIndicator } from './ProfileCompletionIndicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface ProfileData {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  
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
  tuitionAmount: string;
}

export function EnhancedProfile({ onSave }: { onSave?: (data: ProfileData) => void }) {
  const { toast } = useToast();
  
  // Initialize with empty state
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: '',
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
    financialNeed: '',
    tuitionAmount: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalData, setOriginalData] = useState<ProfileData | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load saved profile on mount (from API or localStorage)
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Try to load from API first
        const response = await fetch('/api/profile', { credentials: 'include' });
        if (response.ok) {
          const apiProfile = await response.json();
          if (apiProfile) {
            setFormData(apiProfile);
            setOriginalData(apiProfile);
            setStoredProfile(apiProfile); // Sync to localStorage
            console.log('Loaded profile from API:', apiProfile);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to load profile from API:', error);
      } finally {
        // Fallback to localStorage if API didn't return data
        const savedProfile = getStoredProfile();
        if (savedProfile && !formData.email) {
          setFormData(savedProfile);
          console.log('Loaded saved profile from localStorage:', savedProfile);
        }
        setIsLoading(false);
      }
    };
    
    loadProfile();
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

  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName?.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Validate GPA range
    if (formData.gpa && (parseFloat(formData.gpa) < 0 || parseFloat(formData.gpa) > 4.0)) {
      errors.gpa = "GPA must be between 0.0 and 4.0";
    }

    // Validate test scores ranges
    if (formData.actScore && (parseInt(formData.actScore) < 1 || parseInt(formData.actScore) > 36)) {
      errors.actScore = "ACT score must be between 1 and 36";
    }
    if (formData.satScore && (parseInt(formData.satScore) < 400 || parseInt(formData.satScore) > 1600)) {
      errors.satScore = "SAT score must be between 400 and 1600";
    }
    if (formData.lsatScore && (parseInt(formData.lsatScore) < 120 || parseInt(formData.lsatScore) > 180)) {
      errors.lsatScore = "LSAT score must be between 120 and 180";
    }
    if (formData.greScore && (parseInt(formData.greScore) < 260 || parseInt(formData.greScore) > 340)) {
      errors.greScore = "GRE score must be between 260 and 340";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before saving
    if (!validateProfile()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Save to API
      const response = await apiRequest('POST', '/api/profile', formData);
      const savedProfile = await response.json();
      
      // Update localStorage and original data
      setStoredProfile(savedProfile);
      setOriginalData(savedProfile);
      onSave?.(savedProfile);
      setIsEditMode(false);
      setValidationErrors({});
      
      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully.",
      });
      console.log('Profile saved:', savedProfile);
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setOriginalData(formData);
    setIsEditMode(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, avatarUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  // Show loading state when initially loading profile
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-profile-title">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Loading your profile...</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-profile-title">Your Profile</h1>
          <p className="text-muted-foreground mt-1">
            Complete your profile to get matched with relevant scholarships
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditMode ? (
            <Button type="button" onClick={handleEdit} data-testid="button-edit-profile">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleCancel} data-testid="button-cancel-edit">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} data-testid="button-save-edit">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <ProfileCompletionIndicator 
        profile={formData}
        onCompleteProfile={handleEdit}
        variant="inline"
      />

      {/* Avatar Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Upload a photo to personalize your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.avatarUrl} alt={`${formData.firstName} ${formData.lastName}`} />
              <AvatarFallback className="text-2xl">
                {formData.firstName?.[0]?.toUpperCase() || <UserIcon className="h-12 w-12" />}
                {formData.lastName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isEditMode ? (
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  data-testid="input-avatar-upload"
                  className="max-w-md"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload a photo (max 2MB). Supported formats: JPG, PNG, GIF
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic details about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditMode ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input disabled={!isEditMode}                     id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    data-testid="input-first-name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input disabled={!isEditMode}                     id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    data-testid="input-last-name"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input disabled={!isEditMode}                   id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-email"
                  required
                />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">First Name</p>
                  <p className="font-medium" data-testid="view-first-name">{formData.firstName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Name</p>
                  <p className="font-medium" data-testid="view-last-name">{formData.lastName || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium" data-testid="view-email">{formData.email || 'Not provided'}</p>
              </div>
            </div>
          )}
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
                disabled={!isEditMode}
                id="major"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder="e.g., Computer Science"
                data-testid="input-major"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select disabled={!isEditMode}                 value={formData.academicYear} 
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
              <Input disabled={!isEditMode}                 id="gpa"
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
              <Label htmlFor="actScore">ACT Score <span className="text-muted-foreground">(Optional, 1-36)</span></Label>
              <Input disabled={!isEditMode}                 id="actScore"
                type="number"
                min="1"
                max="36"
                value={formData.actScore}
                onChange={(e) => setFormData({ ...formData, actScore: e.target.value })}
                placeholder="Leave blank if not taken"
                data-testid="input-act"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="satScore">SAT Score <span className="text-muted-foreground">(Optional, 400-1600)</span></Label>
              <Input disabled={!isEditMode}                 id="satScore"
                type="number"
                min="400"
                max="1600"
                value={formData.satScore}
                onChange={(e) => setFormData({ ...formData, satScore: e.target.value })}
                placeholder="Leave blank if not taken"
                data-testid="input-sat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lsatScore">LSAT Score <span className="text-muted-foreground">(Optional, 120-180)</span></Label>
              <Input disabled={!isEditMode}                 id="lsatScore"
                type="number"
                min="120"
                max="180"
                value={formData.lsatScore}
                onChange={(e) => setFormData({ ...formData, lsatScore: e.target.value })}
                placeholder="Leave blank if not taken"
                data-testid="input-lsat"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="greScore">GRE Score <span className="text-muted-foreground">(Optional, 260-340)</span></Label>
            <Input disabled={!isEditMode}               id="greScore"
              type="number"
              min="260"
              max="340"
              value={formData.greScore}
              onChange={(e) => setFormData({ ...formData, greScore: e.target.value })}
              placeholder="Leave blank if not taken"
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
              <Select disabled={!isEditMode}                 value={formData.ethnicity} 
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
              <Select disabled={!isEditMode}                 value={formData.gender} 
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
              <Checkbox disabled={!isEditMode}                 id="firstGen"
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
              <Checkbox disabled={!isEditMode}                 id="veteran"
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
              <Checkbox disabled={!isEditMode}                 id="disability"
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
              <Input disabled={!isEditMode}                 value={newExtracurricular}
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
                disabled={!isEditMode} onClick={() => addItem('extracurriculars', newExtracurricular, setNewExtracurricular)}
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
                    disabled={!isEditMode} onClick={() => removeItem('extracurriculars', index)}
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
              <Input disabled={!isEditMode}                 value={newSkill}
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
                disabled={!isEditMode} onClick={() => addItem('skills', newSkill, setNewSkill)}
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
                    disabled={!isEditMode} onClick={() => removeItem('skills', index)}
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
              <Input disabled={!isEditMode}                 value={newLeadership}
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
                disabled={!isEditMode} onClick={() => addItem('leadershipRoles', newLeadership, setNewLeadership)}
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
                    disabled={!isEditMode} onClick={() => removeItem('leadershipRoles', index)}
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
            <Input disabled={!isEditMode}               id="volunteerHours"
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
          <CardDescription>Help us match you with need-based scholarships and calculate financial aid</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tuitionAmount">Total Tuition Amount</Label>
            <Input disabled={!isEditMode}               id="tuitionAmount"
              type="number"
              min="0"
              value={formData.tuitionAmount}
              onChange={(e) => setFormData({ ...formData, tuitionAmount: e.target.value })}
              placeholder="50000"
              data-testid="input-tuition-amount"
            />
            <p className="text-xs text-muted-foreground">
              Enter your total yearly tuition to calculate loan eligibility after scholarships
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="financialNeed">Financial Need Level</Label>
            <Select disabled={!isEditMode}               value={formData.financialNeed} 
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

    </form>
  );
}
