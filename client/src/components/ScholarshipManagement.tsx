import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, DollarSign, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Scholarship {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  category: string;
  eligibility: string;
  minGPA?: string;
  minACT?: number;
  minSAT?: number;
  minLSAT?: number;
  minGRE?: number;
  ethnicityRequirements?: string[];
  requiresFirstGen?: boolean;
  requiresVeteran?: boolean;
  requiresDisability?: boolean;
  majorRequirements?: string[];
  skillRequirements?: string[];
  minVolunteerHours?: number;
  requiresEssay?: boolean;
  status: string;
}

export function ScholarshipManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Scholarship>>({
    title: '',
    description: '',
    amount: 0,
    deadline: '',
    category: '',
    eligibility: '',
    status: 'active',
    requiresEssay: false,
    requiresFirstGen: false,
    requiresVeteran: false,
    requiresDisability: false,
    ethnicityRequirements: [],
    majorRequirements: [],
    skillRequirements: [],
  });

  const { data: scholarships = [], isLoading } = useQuery<Scholarship[]>({
    queryKey: ['/api/scholarships'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Scholarship>) => {
      return await apiRequest('POST', '/api/scholarships', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scholarships'] });
      toast({ title: 'Success', description: 'Scholarship created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create scholarship', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Scholarship> }) => {
      return await apiRequest('PATCH', `/api/scholarships/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scholarships'] });
      toast({ title: 'Success', description: 'Scholarship updated successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update scholarship', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/scholarships/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scholarships'] });
      toast({ title: 'Success', description: 'Scholarship deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete scholarship', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      amount: 0,
      deadline: '',
      category: '',
      eligibility: '',
      status: 'active',
      requiresEssay: false,
      requiresFirstGen: false,
      requiresVeteran: false,
      requiresDisability: false,
      ethnicityRequirements: [],
      majorRequirements: [],
      skillRequirements: [],
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (scholarship: Scholarship) => {
    setFormData(scholarship);
    setEditingId(scholarship.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this scholarship?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Scholarship Management</h2>
          <p className="text-muted-foreground">Manage scholarship opportunities for students</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} data-testid="button-add-scholarship">
              <Plus className="mr-2 h-4 w-4" />
              Add Scholarship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Scholarship' : 'Add New Scholarship'}</DialogTitle>
              <DialogDescription>Fill in the details for the scholarship opportunity</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Scholarship Title</Label>
                  <Input
                    id="title"
                    data-testid="input-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="input-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    data-testid="input-amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    data-testid="input-deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STEM">STEM</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Financial Aid">Financial Aid</SelectItem>
                      <SelectItem value="Diversity">Diversity</SelectItem>
                      <SelectItem value="Athletics">Athletics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="minGPA">Minimum GPA</Label>
                  <Input
                    id="minGPA"
                    data-testid="input-min-gpa"
                    type="number"
                    step="0.01"
                    value={formData.minGPA || ''}
                    onChange={(e) => setFormData({ ...formData, minGPA: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="minACT">Minimum ACT</Label>
                  <Input
                    id="minACT"
                    data-testid="input-min-act"
                    type="number"
                    value={formData.minACT || ''}
                    onChange={(e) => setFormData({ ...formData, minACT: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="minSAT">Minimum SAT</Label>
                  <Input
                    id="minSAT"
                    data-testid="input-min-sat"
                    type="number"
                    value={formData.minSAT || ''}
                    onChange={(e) => setFormData({ ...formData, minSAT: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="eligibility">Eligibility Requirements</Label>
                  <Textarea
                    id="eligibility"
                    data-testid="input-eligibility"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Special Requirements</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresFirstGen"
                        data-testid="checkbox-first-gen"
                        checked={formData.requiresFirstGen}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, requiresFirstGen: checked as boolean })
                        }
                      />
                      <Label htmlFor="requiresFirstGen" className="font-normal">First Generation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresVeteran"
                        data-testid="checkbox-veteran"
                        checked={formData.requiresVeteran}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, requiresVeteran: checked as boolean })
                        }
                      />
                      <Label htmlFor="requiresVeteran" className="font-normal">Veteran</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresEssay"
                        data-testid="checkbox-essay"
                        checked={formData.requiresEssay}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, requiresEssay: checked as boolean })
                        }
                      />
                      <Label htmlFor="requiresEssay" className="font-normal">Requires Essay</Label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-scholarship">
                  {editingId ? 'Update' : 'Create'} Scholarship
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading scholarships...</div>
      ) : scholarships.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No scholarships yet. Click "Add Scholarship" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scholarships.map((scholarship) => (
            <Card key={scholarship.id} data-testid={`card-scholarship-${scholarship.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{scholarship.title}</CardTitle>
                    <CardDescription className="mt-2">{scholarship.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(scholarship)}
                      data-testid={`button-edit-${scholarship.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(scholarship.id)}
                      data-testid={`button-delete-${scholarship.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">${scholarship.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(scholarship.deadline).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <Badge variant="secondary">{scholarship.category}</Badge>
                  </div>
                  <div>
                    <Badge variant={scholarship.status === 'active' ? 'default' : 'outline'}>
                      {scholarship.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  {scholarship.minGPA && <p className="text-muted-foreground">Min GPA: {scholarship.minGPA}</p>}
                  {scholarship.minACT && <p className="text-muted-foreground">Min ACT: {scholarship.minACT}</p>}
                  {scholarship.minSAT && <p className="text-muted-foreground">Min SAT: {scholarship.minSAT}</p>}
                  {scholarship.requiresFirstGen && <p className="text-muted-foreground">• First Generation Required</p>}
                  {scholarship.requiresEssay && <p className="text-muted-foreground">• Essay Required</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
