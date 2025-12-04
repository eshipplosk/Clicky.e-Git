import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileWarning, 
  Bell, 
  X,
  ChevronRight,
  AlertTriangle,
  Info
} from "lucide-react";
import { Link } from "wouter";
import type { Notification } from "@shared/schema";

interface NotificationCenterProps {
  showTitle?: boolean;
  maxNotifications?: number;
  compact?: boolean;
}

const priorityConfig = {
  urgent: {
    icon: AlertCircle,
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    badgeVariant: "destructive" as const,
  },
  high: {
    icon: AlertTriangle,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeVariant: "secondary" as const,
  },
  medium: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeVariant: "secondary" as const,
  },
  low: {
    icon: Bell,
    bgColor: "bg-gray-50 dark:bg-gray-900/30",
    borderColor: "border-gray-200 dark:border-gray-700",
    iconColor: "text-gray-600 dark:text-gray-400",
    badgeVariant: "outline" as const,
  },
};

const typeConfig: Record<string, { icon: typeof AlertCircle; label: string }> = {
  missing_profile_fields: { icon: FileWarning, label: "Profile Incomplete" },
  missing_documents: { icon: FileWarning, label: "Missing Documents" },
  invalid_documents: { icon: AlertCircle, label: "Invalid Documents" },
  deadline_approaching: { icon: Clock, label: "Deadline Soon" },
  application_approved: { icon: CheckCircle, label: "Approved" },
  application_denied: { icon: AlertCircle, label: "Update" },
  scholarship_updated: { icon: Info, label: "Updated" },
  technical_error: { icon: AlertTriangle, label: "Technical Issue" },
  document_rejected: { icon: AlertCircle, label: "Document Rejected" },
  application_incomplete: { icon: FileWarning, label: "Incomplete" },
};

export function NotificationCenter({ 
  showTitle = true, 
  maxNotifications,
  compact = false 
}: NotificationCenterProps) {
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div 
            key={i} 
            className="h-16 bg-muted animate-pulse rounded-md"
            data-testid={`notification-skeleton-${i}`}
          />
        ))}
      </div>
    );
  }

  const displayedNotifications = maxNotifications 
    ? notifications.slice(0, maxNotifications) 
    : notifications;

  if (displayedNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" data-testid="notification-center">
      {showTitle && (
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Action Required ({notifications.length})
          </h3>
        </div>
      )}
      
      <div className="space-y-2">
        {displayedNotifications.map((notification) => {
          const priority = priorityConfig[notification.priority as keyof typeof priorityConfig] || priorityConfig.medium;
          const type = typeConfig[notification.type] || { icon: Bell, label: "Notification" };
          const PriorityIcon = priority.icon;
          const TypeIcon = type.icon;

          return (
            <Card
              key={notification.id}
              className={`p-3 border ${priority.bgColor} ${priority.borderColor} ${
                !notification.isRead ? "ring-1 ring-primary/20" : ""
              }`}
              data-testid={`notification-item-${notification.id}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${priority.iconColor}`}>
                  <PriorityIcon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">
                      {notification.title}
                    </span>
                    <Badge 
                      variant={priority.badgeVariant} 
                      className="text-xs"
                    >
                      {type.label}
                    </Badge>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  
                  {!compact && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {notification.actionUrl && notification.actionText && (
                      <Link href={notification.actionUrl}>
                        <Button 
                          size="sm" 
                          variant="default"
                          className="h-7 text-xs"
                          onClick={() => {
                            if (!notification.isRead) {
                              markReadMutation.mutate(notification.id);
                            }
                          }}
                          data-testid={`notification-action-${notification.id}`}
                        >
                          {notification.actionText}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => resolveMutation.mutate(notification.id)}
                      disabled={resolveMutation.isPending}
                      data-testid={`notification-dismiss-${notification.id}`}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {maxNotifications && notifications.length > maxNotifications && (
        <Link href="/student/notifications">
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            data-testid="notification-view-all"
          >
            View all {notifications.length} notifications
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      )}
    </div>
  );
}

export function NotificationBanner() {
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const urgentNotifications = notifications.filter(
    n => n.priority === 'urgent' || n.priority === 'high'
  );

  const resolveMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  if (urgentNotifications.length === 0) {
    return null;
  }

  const notification = urgentNotifications[0];
  const priority = priorityConfig[notification.priority as keyof typeof priorityConfig] || priorityConfig.high;
  const PriorityIcon = priority.icon;

  return (
    <div 
      className={`${priority.bgColor} border-b ${priority.borderColor} px-4 py-2`}
      data-testid="notification-banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PriorityIcon className={`h-5 w-5 flex-shrink-0 ${priority.iconColor}`} />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-sm">{notification.title}: </span>
            <span className="text-sm text-muted-foreground truncate">
              {notification.message}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {notification.actionUrl && notification.actionText && (
            <Link href={notification.actionUrl}>
              <Button 
                size="sm" 
                variant="default"
                className="h-7 text-xs"
                data-testid="banner-action-button"
              >
                {notification.actionText}
              </Button>
            </Link>
          )}
          
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => resolveMutation.mutate(notification.id)}
            disabled={resolveMutation.isPending}
            data-testid="banner-dismiss-button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {urgentNotifications.length > 1 && (
        <div className="max-w-7xl mx-auto mt-1">
          <span className="text-xs text-muted-foreground">
            +{urgentNotifications.length - 1} more urgent notification{urgentNotifications.length > 2 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

export function NotificationBell() {
  const { data: countData } = useQuery<{ total: number; unread: number }>({
    queryKey: ["/api/notifications/count"],
    refetchInterval: 30000,
  });

  const unreadCount = countData?.unread || 0;

  return (
    <Link href="/student/notifications">
      <Button 
        size="icon" 
        variant="ghost" 
        className="relative"
        data-testid="notification-bell"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center"
            data-testid="notification-bell-count"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
