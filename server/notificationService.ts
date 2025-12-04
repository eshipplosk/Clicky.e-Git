import { storage } from "./storage";
import { 
  notificationTypes, 
  notificationPriorities,
  type NotificationType,
  type NotificationPriority,
  type Notification,
  type InsertNotification,
  type StudentProfile,
  type Scholarship,
  type ScholarshipApplication
} from "@shared/schema";
import { 
  sendDeadlineReminderEmail, 
  sendDocumentReminderEmail, 
  sendStatusUpdateEmail 
} from "./emailService";

interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  actionText: string;
  actionUrl: string;
  priority: NotificationPriority;
  relatedEntityType?: string;
  relatedEntityId?: string;
  sendEmail?: boolean;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
}

const REQUIRED_PROFILE_FIELDS = [
  'firstName', 'lastName', 'email', 'major', 'gpa', 'academicYear',
  'ethnicity', 'gender', 'extracurriculars', 'skills', 
  'volunteerHours', 'leadershipRoles', 'financialNeed', 'tuitionAmount'
];

function getMissingProfileFields(profile: StudentProfile): string[] {
  const missing: string[] = [];
  
  if (!profile.firstName) missing.push('First Name');
  if (!profile.lastName) missing.push('Last Name');
  if (!profile.email) missing.push('Email');
  if (!profile.major) missing.push('Major');
  if (!profile.gpa) missing.push('GPA');
  if (!profile.academicYear) missing.push('Academic Year');
  if (!profile.ethnicity) missing.push('Ethnicity');
  if (!profile.gender) missing.push('Gender');
  if (!profile.financialNeed) missing.push('Financial Need');
  if (!profile.tuitionAmount) missing.push('Tuition Amount');
  
  if (!profile.actScore && !profile.satScore && !profile.lsatScore && !profile.greScore) {
    missing.push('Test Score (ACT, SAT, LSAT, or GRE)');
  }
  
  if (!profile.extracurriculars || profile.extracurriculars.length === 0) {
    missing.push('Extracurricular Activities');
  }
  if (!profile.skills || profile.skills.length === 0) {
    missing.push('Skills');
  }
  if (profile.volunteerHours === null || profile.volunteerHours === undefined) {
    missing.push('Volunteer Hours');
  }
  if (!profile.leadershipRoles || profile.leadershipRoles.length === 0) {
    missing.push('Leadership Roles');
  }
  
  return missing;
}

export async function createNotification(
  userId: string,
  config: NotificationConfig
): Promise<Notification> {
  const notification = await storage.createNotification({
    userId,
    type: config.type,
    title: config.title,
    message: config.message,
    actionText: config.actionText,
    actionUrl: config.actionUrl,
    priority: config.priority,
    relatedEntityType: config.relatedEntityType,
    relatedEntityId: config.relatedEntityId,
    sendEmail: config.sendEmail ?? false,
    metadata: config.metadata ? JSON.stringify(config.metadata) : null,
    expiresAt: config.expiresAt,
  });

  if (config.sendEmail && notification) {
    await sendNotificationEmail(userId, notification, config);
  }

  return notification;
}

async function sendNotificationEmail(
  userId: string, 
  notification: Notification,
  config: NotificationConfig
): Promise<void> {
  try {
    const profile = await storage.getStudentProfileByUserId(userId);
    if (!profile || !profile.emailNotifications) return;

    const studentName = `${profile.firstName} ${profile.lastName}`;
    const email = profile.email;

    switch (config.type) {
      case notificationTypes.DEADLINE_APPROACHING:
        if (profile.emailDeadlineReminders) {
          const scholarship = config.relatedEntityId 
            ? await storage.getScholarship(config.relatedEntityId)
            : null;
          if (scholarship) {
            await sendDeadlineReminderEmail(
              studentName,
              email,
              scholarship.title,
              scholarship.deadline,
              config.relatedEntityId || ''
            );
          }
        }
        break;

      case notificationTypes.MISSING_DOCUMENTS:
      case notificationTypes.DOCUMENT_REJECTED:
        if (profile.emailApplicationUpdates) {
          const missingDocs = config.metadata?.missingDocuments as string[] || 
            [config.metadata?.documentType as string || 'Required Document'];
          const scholarship = config.relatedEntityId 
            ? await storage.getScholarship(config.metadata?.scholarshipId as string)
            : null;
          await sendDocumentReminderEmail(
            studentName,
            email,
            config.metadata?.scholarshipTitle as string || 'Your Scholarship',
            missingDocs,
            scholarship?.deadline,
            config.relatedEntityId || ''
          );
        }
        break;

      case notificationTypes.APPLICATION_APPROVED:
      case notificationTypes.APPLICATION_DENIED:
        if (profile.emailApplicationUpdates) {
          await sendStatusUpdateEmail(
            studentName,
            email,
            [{
              scholarshipTitle: config.metadata?.scholarshipTitle as string || 'Your Scholarship',
              status: config.type === notificationTypes.APPLICATION_APPROVED ? 'Approved' : 'Denied'
            }]
          );
        }
        break;

      default:
        console.log(`Email not configured for notification type: ${config.type}`);
    }

    await storage.markNotificationEmailSent(notification.id);
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
}

export async function checkAndCreateProfileNotification(userId: string): Promise<Notification | null> {
  const profile = await storage.getStudentProfileByUserId(userId);
  if (!profile) return null;

  const missingFields = getMissingProfileFields(profile);
  
  if (missingFields.length === 0) {
    await resolveNotificationsByType(userId, notificationTypes.MISSING_PROFILE_FIELDS);
    return null;
  }

  const existingNotification = await storage.getUnresolvedNotificationByType(
    userId, 
    notificationTypes.MISSING_PROFILE_FIELDS
  );

  if (existingNotification) {
    const existingMetadata = existingNotification.metadata 
      ? JSON.parse(existingNotification.metadata) 
      : {};
    const existingFields = existingMetadata.missingFields || [];
    
    if (JSON.stringify(existingFields.sort()) === JSON.stringify(missingFields.sort())) {
      return existingNotification;
    }
    
    await storage.resolveNotification(existingNotification.id);
  }

  const fieldsList = missingFields.slice(0, 3).join(', ');
  const moreCount = missingFields.length > 3 ? ` and ${missingFields.length - 3} more` : '';

  return createNotification(userId, {
    type: notificationTypes.MISSING_PROFILE_FIELDS,
    title: 'Complete Your Profile',
    message: `Missing: ${fieldsList}${moreCount}. Complete your profile to improve scholarship matches.`,
    actionText: 'Complete Profile',
    actionUrl: '/student/profile',
    priority: notificationPriorities.HIGH,
    relatedEntityType: 'profile',
    relatedEntityId: profile.id,
    metadata: { missingFields },
  });
}

export async function checkDeadlineNotifications(userId: string): Promise<Notification[]> {
  const profile = await storage.getStudentProfileByUserId(userId);
  if (!profile) return [];

  const applications = await storage.getScholarshipApplicationsByUserId(userId);
  const notifications: Notification[] = [];
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  for (const app of applications) {
    if (app.status === 'approved' || app.status === 'declined') continue;

    const scholarship = await storage.getScholarship(app.scholarshipId);
    if (!scholarship) continue;

    const deadline = new Date(scholarship.deadline);
    if (deadline < now) continue;

    const existing = await storage.getUnresolvedNotificationByTypeAndEntity(
      userId,
      notificationTypes.DEADLINE_APPROACHING,
      'application',
      app.id
    );

    if (!existing && deadline <= oneWeekFromNow) {
      const isUrgent = deadline <= threeDaysFromNow;
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      const notification = await createNotification(userId, {
        type: notificationTypes.DEADLINE_APPROACHING,
        title: isUrgent ? 'Urgent: Deadline Approaching' : 'Deadline Reminder',
        message: `${scholarship.title} deadline is in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Make sure you've submitted all required documents.`,
        actionText: 'View Application',
        actionUrl: '/student/my-scholarships',
        priority: isUrgent ? notificationPriorities.URGENT : notificationPriorities.HIGH,
        relatedEntityType: 'application',
        relatedEntityId: app.id,
        sendEmail: profile.emailDeadlineReminders ?? true,
        metadata: { 
          scholarshipId: scholarship.id,
          scholarshipTitle: scholarship.title,
          deadline: scholarship.deadline.toISOString(),
          daysLeft 
        },
        expiresAt: deadline,
      });
      
      notifications.push(notification);
    }
  }

  return notifications;
}

export async function checkMissingDocumentsNotification(
  userId: string, 
  applicationId: string
): Promise<Notification | null> {
  const application = await storage.getScholarshipApplicationById(applicationId);
  if (!application || application.userId !== userId) return null;

  const scholarship = await storage.getScholarship(application.scholarshipId);
  if (!scholarship) return null;

  const documents = await storage.getApplicationDocuments(applicationId);
  const requiredDocs = scholarship.requiredDocuments || [];
  
  const uploadedDocTypes = documents
    .filter(doc => doc.status === 'uploaded')
    .map(doc => doc.documentType);

  const missingDocs = requiredDocs.filter(docType => !uploadedDocTypes.includes(docType));

  if (missingDocs.length === 0) {
    await storage.resolveNotificationsByTypeAndEntity(
      userId,
      notificationTypes.MISSING_DOCUMENTS,
      'application',
      applicationId
    );
    return null;
  }

  const existing = await storage.getUnresolvedNotificationByTypeAndEntity(
    userId,
    notificationTypes.MISSING_DOCUMENTS,
    'application',
    applicationId
  );

  if (existing) return existing;

  const profile = await storage.getStudentProfileByUserId(userId);
  
  return createNotification(userId, {
    type: notificationTypes.MISSING_DOCUMENTS,
    title: 'Missing Documents',
    message: `${scholarship.title} requires ${missingDocs.length} missing document${missingDocs.length > 1 ? 's' : ''}: ${missingDocs.join(', ')}.`,
    actionText: 'Upload Documents',
    actionUrl: '/student/my-scholarships',
    priority: notificationPriorities.HIGH,
    relatedEntityType: 'application',
    relatedEntityId: applicationId,
    sendEmail: profile?.emailApplicationUpdates ?? true,
    metadata: { 
      scholarshipId: scholarship.id,
      scholarshipTitle: scholarship.title,
      missingDocuments: missingDocs 
    },
  });
}

export async function createRejectedDocumentNotification(
  userId: string,
  applicationId: string,
  documentType: string,
  rejectionReason: string
): Promise<Notification> {
  const application = await storage.getScholarshipApplicationById(applicationId);
  const scholarship = application 
    ? await storage.getScholarship(application.scholarshipId)
    : null;
  const profile = await storage.getStudentProfileByUserId(userId);

  return createNotification(userId, {
    type: notificationTypes.DOCUMENT_REJECTED,
    title: 'Document Rejected',
    message: `Your ${documentType} for ${scholarship?.title || 'scholarship'} was rejected: ${rejectionReason}. Please re-upload a corrected version.`,
    actionText: 'Re-upload Document',
    actionUrl: '/student/my-scholarships',
    priority: notificationPriorities.URGENT,
    relatedEntityType: 'application',
    relatedEntityId: applicationId,
    sendEmail: profile?.emailApplicationUpdates ?? true,
    metadata: { 
      documentType,
      rejectionReason,
      scholarshipTitle: scholarship?.title 
    },
  });
}

export async function createApplicationStatusNotification(
  userId: string,
  applicationId: string,
  status: 'approved' | 'declined'
): Promise<Notification> {
  const application = await storage.getScholarshipApplicationById(applicationId);
  const scholarship = application 
    ? await storage.getScholarship(application.scholarshipId)
    : null;
  const profile = await storage.getStudentProfileByUserId(userId);

  const isApproved = status === 'approved';
  
  return createNotification(userId, {
    type: isApproved ? notificationTypes.APPLICATION_APPROVED : notificationTypes.APPLICATION_DENIED,
    title: isApproved ? 'Application Approved!' : 'Application Update',
    message: isApproved 
      ? `Congratulations! Your application for ${scholarship?.title || 'the scholarship'} has been approved.`
      : `Your application for ${scholarship?.title || 'the scholarship'} was not selected. Don't give up - explore other opportunities!`,
    actionText: isApproved ? 'View Details' : 'Find More Scholarships',
    actionUrl: isApproved ? '/student/my-scholarships' : '/student/dashboard',
    priority: isApproved ? notificationPriorities.HIGH : notificationPriorities.MEDIUM,
    relatedEntityType: 'application',
    relatedEntityId: applicationId,
    sendEmail: profile?.emailApplicationUpdates ?? true,
    metadata: { 
      scholarshipId: scholarship?.id,
      scholarshipTitle: scholarship?.title,
      status,
      amount: scholarship?.amount
    },
  });
}

export async function createScholarshipUpdateNotification(
  userId: string,
  scholarshipId: string,
  updateDescription: string
): Promise<Notification> {
  const scholarship = await storage.getScholarship(scholarshipId);
  const profile = await storage.getStudentProfileByUserId(userId);

  return createNotification(userId, {
    type: notificationTypes.SCHOLARSHIP_UPDATED,
    title: 'Scholarship Requirements Updated',
    message: `${scholarship?.title || 'A scholarship you applied to'} has new requirements: ${updateDescription}`,
    actionText: 'Review Changes',
    actionUrl: '/student/my-scholarships',
    priority: notificationPriorities.HIGH,
    relatedEntityType: 'scholarship',
    relatedEntityId: scholarshipId,
    sendEmail: profile?.emailApplicationUpdates ?? true,
    metadata: { 
      scholarshipTitle: scholarship?.title,
      updateDescription 
    },
  });
}

export async function createTechnicalErrorNotification(
  userId: string,
  errorDescription: string,
  applicationId?: string
): Promise<Notification> {
  return createNotification(userId, {
    type: notificationTypes.TECHNICAL_ERROR,
    title: 'Technical Issue Detected',
    message: `We encountered an issue: ${errorDescription}. Our team has been notified. Please try again or contact support if the issue persists.`,
    actionText: 'Contact Support',
    actionUrl: '/student/support',
    priority: notificationPriorities.HIGH,
    relatedEntityType: applicationId ? 'application' : undefined,
    relatedEntityId: applicationId,
    metadata: { errorDescription },
  });
}

export async function resolveNotificationsByType(
  userId: string, 
  type: NotificationType
): Promise<void> {
  await storage.resolveNotificationsByType(userId, type);
}

export async function resolveNotification(notificationId: string): Promise<void> {
  await storage.resolveNotification(notificationId);
}

export async function getActiveNotifications(userId: string): Promise<Notification[]> {
  return storage.getActiveNotifications(userId);
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await storage.markNotificationAsRead(notificationId);
}

export async function runNotificationChecks(userId: string): Promise<{
  profileNotification: Notification | null;
  deadlineNotifications: Notification[];
  documentNotifications: Notification[];
}> {
  const profileNotification = await checkAndCreateProfileNotification(userId);
  const deadlineNotifications = await checkDeadlineNotifications(userId);
  
  const applications = await storage.getScholarshipApplicationsByUserId(userId);
  const documentNotifications: Notification[] = [];
  
  for (const app of applications) {
    if (app.status === 'pending' || app.status === 'accepted') {
      const docNotification = await checkMissingDocumentsNotification(userId, app.id);
      if (docNotification) {
        documentNotifications.push(docNotification);
      }
    }
  }

  return {
    profileNotification,
    deadlineNotifications,
    documentNotifications,
  };
}
