import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, UserCog } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  role: 'student' | 'admin';
}

export function UserManagement() {
  const { toast } = useToast();
  
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const toggleRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const response = await apiRequest('PATCH', `/api/users/${userId}/role`, { role: newRole });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role',
        variant: 'destructive',
      });
    },
  });

  const handleToggleRole = (user: User) => {
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    toggleRoleMutation.mutate({ userId: user.id, newRole });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
              data-testid={`user-${user.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  {user.role === 'admin' ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium" data-testid={`text-username-${user.id}`}>
                    {user.username}
                  </p>
                  <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                  data-testid={`badge-role-${user.id}`}
                >
                  {user.role}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleRole(user)}
                  disabled={toggleRoleMutation.isPending}
                  data-testid={`button-toggle-role-${user.id}`}
                >
                  Make {user.role === 'admin' ? 'Student' : 'Admin'}
                </Button>
              </div>
            </div>
          ))}
          
          {users?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
