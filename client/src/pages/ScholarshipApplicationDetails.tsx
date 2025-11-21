import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock,
  FileText,
  Upload,
  ChevronLeft,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";
import { format, differenceInDays } from "date-fns";

interface RequirementCheck {
  requirement: string;
  status: 'met' | 'missing' | 'not_eligible';
  studentValue?: string | number | boolean | null;
  requiredValue?: string | number | boolean | null;
  details?: string;
}

interface DocumentCheck {
  documentType: string;
  status: 'uploaded' | 'pending' | 'rejected';
  fileName: string | null;
  rejectionReason: string | null;
  uploadedAt: Date | null;
  deadline: Date | null;
  id: string | null;
}

export default function ScholarshipApplicationDetails() {
  const [, params] = useRoute("/student/applications/:scholarshipId/details");
  const scholarshipId = params?.scholarshipId;

  const { data, isLoading } = useQuery<{
    scholarship: any;
    application: any;
    profile: any;
    requirements: RequirementCheck[];
    documentChecklist: DocumentCheck[];
  }>({
    queryKey: [`/api/scholarship-applications/${scholarshipId}/details`],
    enabled: !!scholarshipId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Application Not Found</CardTitle>
            <CardDescription>The scholarship application you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/student/dashboard">
              <Button data-testid="button-back-dashboard">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { scholarship, requirements, documentChecklist } = data;

  // Calculate deadline urgency
  const getDeadlineStatus = (deadline: Date | string) => {
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (daysRemaining < 0) return { color: 'red', label: 'Overdue', days: daysRemaining };
    if (daysRemaining < 3) return { color: 'red', label: 'Urgent', days: daysRemaining };
    if (daysRemaining <= 7) return { color: 'yellow', label: 'Soon', days: daysRemaining };
    return { color: 'green', label: 'On Track', days: daysRemaining };
  };

  const mainDeadline = getDeadlineStatus(scholarship.deadline);

  // Count documents by status
  const uploadedCount = documentChecklist.filter(d => d.status === 'uploaded').length;
  const pendingCount = documentChecklist.filter(d => d.status === 'pending').length;
  const rejectedCount = documentChecklist.filter(d => d.status === 'rejected').length;

  // Count requirements by status
  const metCount = requirements.filter(r => r.status === 'met').length;
  const missingCount = requirements.filter(r => r.status === 'missing').length;
  const notEligibleCount = requirements.filter(r => r.status === 'not_eligible').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'met':
      case 'uploaded':
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'missing':
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'not_eligible':
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'met':
      case 'uploaded':
        return 'default';
      case 'missing':
      case 'pending':
        return 'secondary';
      case 'not_eligible':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getDeadlineColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30';
      case 'yellow':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30';
      case 'red':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Back Button */}
      <Link href="/student/dashboard">
        <Button variant="ghost" data-testid="button-back-dashboard">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Summary Card */}
      <Card data-testid="card-application-summary">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">{scholarship.title}</CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Award Amount: ${scholarship.amount.toLocaleString()}
              </CardDescription>
            </div>
            <div className={`px-4 py-2 rounded-md ${getDeadlineColor(mainDeadline.color)}`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <div>
                  <div className="font-semibold">{mainDeadline.label}</div>
                  <div className="text-sm">
                    {mainDeadline.days >= 0 ? `${mainDeadline.days} days left` : `${Math.abs(mainDeadline.days)} days overdue`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-md bg-muted">
              <div className="text-sm text-muted-foreground">Documents Uploaded</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-uploaded-count">{uploadedCount}</div>
            </div>
            <div className="p-4 rounded-md bg-muted">
              <div className="text-sm text-muted-foreground">Pending Documents</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" data-testid="text-pending-count">{pendingCount}</div>
            </div>
            <div className="p-4 rounded-md bg-muted">
              <div className="text-sm text-muted-foreground">Rejected Documents</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-rejected-count">{rejectedCount}</div>
            </div>
            <div className="p-4 rounded-md bg-muted">
              <div className="text-sm text-muted-foreground">Main Deadline</div>
              <div className="text-sm font-semibold" data-testid="text-main-deadline">{format(new Date(scholarship.deadline), 'MMM d, yyyy')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scholarship Information */}
      <Card data-testid="card-scholarship-info">
        <CardHeader>
          <CardTitle>Scholarship Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-muted-foreground">{scholarship.description}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Eligibility</h4>
            <p className="text-muted-foreground">{scholarship.eligibility}</p>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Badge>{scholarship.category}</Badge>
            {scholarship.requiresEssay && <Badge variant="secondary">Essay Required</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Requirements Comparison */}
      <Card data-testid="card-requirements">
        <CardHeader>
          <CardTitle>Eligibility Requirements</CardTitle>
          <CardDescription>
            Your profile compared to scholarship requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {requirements.map((req, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-md hover-elevate"
                data-testid={`requirement-${index}`}
              >
                <div className="mt-0.5">{getStatusIcon(req.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{req.requirement}</span>
                    <Badge variant={getStatusBadgeVariant(req.status)} className="text-xs">
                      {req.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{req.details}</p>
                </div>
              </div>
            ))}
          </div>

          {requirements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No specific requirements for this scholarship</p>
            </div>
          )}

          {requirements.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Eligibility Progress</span>
                <span className="font-medium">{metCount} of {requirements.length} met</span>
              </div>
              <Progress value={(metCount / requirements.length) * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Checklist */}
      <Card data-testid="card-documents">
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Upload and track all required documents for this application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documentChecklist.map((doc, index) => {
              const docDeadline = doc.deadline ? getDeadlineStatus(doc.deadline) : null;
              const isOverdue = doc.status === 'pending' && doc.deadline && differenceInDays(new Date(doc.deadline), new Date()) < 0;

              return (
                <div
                  key={index}
                  className="border rounded-md p-4 space-y-3"
                  data-testid={`document-${index}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">{getStatusIcon(doc.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium">{doc.documentType}</span>
                          <Badge variant={getStatusBadgeVariant(doc.status)} className="text-xs">
                            {doc.status}
                          </Badge>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>

                        {doc.fileName && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            <span>{doc.fileName}</span>
                          </div>
                        )}

                        {doc.uploadedAt && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="w-4 h-4" />
                            <span>Uploaded {format(new Date(doc.uploadedAt), 'MMM d, yyyy h:mm a')}</span>
                          </div>
                        )}

                        {doc.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 rounded-md">
                            <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Rejection Reason:</div>
                            <div className="text-sm text-red-600 dark:text-red-400">{doc.rejectionReason}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={doc.status === 'uploaded' ? 'outline' : 'default'}
                      data-testid={`button-upload-${index}`}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {doc.status === 'uploaded' ? 'Replace' : 'Upload'}
                    </Button>
                  </div>

                  {docDeadline && (
                    <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${getDeadlineColor(docDeadline.color)}`}>
                      <Calendar className="w-4 h-4" />
                      <span>
                        Deadline: {format(new Date(doc.deadline!), 'MMM d, yyyy')} 
                        ({docDeadline.days >= 0 ? `${docDeadline.days} days left` : `${Math.abs(docDeadline.days)} days overdue`})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {documentChecklist.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2" />
              <p>No documents required for this scholarship</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
