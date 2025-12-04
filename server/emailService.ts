/**
 * Email Notification Service
 * 
 * Handles automated email notifications for scholarship applications using Resend.
 * This service sends:
 * - Confirmation emails when applications are submitted
 * - Approval emails when applications are approved
 * - Reminder emails for pending documents/actions
 * - Periodic workflow updates
 * 
 * Uses Resend integration configured via Replit connectors.
 */

import { Resend } from 'resend';

let connectionSettings: any;

/**
 * Fetches credentials from Replit's connector system
 * This allows secure access to the Resend API key without hardcoding
 */
async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

/**
 * Gets a fresh Resend client
 * WARNING: Never cache this client as tokens can expire
 */
export async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

// Email template types
export type EmailType = 
  | 'application_submitted'
  | 'application_approved'
  | 'application_rejected'
  | 'document_reminder'
  | 'deadline_reminder'
  | 'status_update';

// Base URL for links in emails (set dynamically based on environment)
function getBaseUrl(): string {
  // Use REPLIT_DEV_DOMAIN for development, or deployed URL for production
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  if (process.env.REPLIT_SLUG && process.env.REPLIT_OWNER) {
    return `https://${process.env.REPLIT_SLUG}.${process.env.REPLIT_OWNER}.repl.co`;
  }
  return 'http://localhost:5000';
}

// Email template data interfaces
interface ApplicationEmailData {
  studentName: string;
  studentEmail: string;
  scholarshipTitle: string;
  scholarshipAmount: number;
  applicationId: string;
}

interface ReminderEmailData {
  studentName: string;
  studentEmail: string;
  scholarshipTitle: string;
  pendingItems: string[];
  deadline?: Date;
  applicationId: string;
}

interface StatusUpdateEmailData {
  studentName: string;
  studentEmail: string;
  updates: Array<{
    scholarshipTitle: string;
    status: string;
    message?: string;
  }>;
}

/**
 * Generates HTML email templates with consistent branding
 */
function generateEmailHtml(
  type: EmailType, 
  data: ApplicationEmailData | ReminderEmailData | StatusUpdateEmailData
): { subject: string; html: string } {
  const baseUrl = getBaseUrl();
  const brandColor = '#ffb800'; // Clicky.e brand yellow
  
  const headerHtml = `
    <div style="background-color: ${brandColor}; padding: 20px; text-align: center;">
      <h1 style="color: #1a1a1a; margin: 0; font-family: Arial, sans-serif; font-size: 24px;">
        Clicky.e Scholarships
      </h1>
    </div>
  `;

  const footerHtml = `
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin-top: 30px;">
      <p style="color: #666; font-size: 12px; margin: 0;">
        You're receiving this email because you have an account on Clicky.e Scholarships.
      </p>
      <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
        <a href="${baseUrl}/student/dashboard" style="color: ${brandColor};">Visit Dashboard</a> |
        <a href="${baseUrl}/student/profile" style="color: ${brandColor};">Update Email Preferences</a>
      </p>
    </div>
  `;

  const buttonStyle = `
    display: inline-block;
    background-color: ${brandColor};
    color: #1a1a1a;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: bold;
    margin: 15px 0;
  `;

  switch (type) {
    case 'application_submitted': {
      const appData = data as ApplicationEmailData;
      return {
        subject: `Application Submitted: ${appData.scholarshipTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            ${headerHtml}
            <div style="padding: 30px;">
              <h2 style="color: #333; margin-top: 0;">Application Submitted Successfully</h2>
              <p style="color: #555; line-height: 1.6;">
                Hi ${appData.studentName},
              </p>
              <p style="color: #555; line-height: 1.6;">
                Your application for the <strong>${appData.scholarshipTitle}</strong> scholarship 
                (worth $${appData.scholarshipAmount.toLocaleString()}) has been submitted successfully.
              </p>
              <p style="color: #555; line-height: 1.6;">
                We'll review your application and notify you once a decision has been made.
              </p>
              <div style="text-align: center;">
                <a href="${baseUrl}/student/my-scholarships" style="${buttonStyle}">
                  View My Applications
                </a>
              </div>
              <p style="color: #888; font-size: 14px; margin-top: 20px;">
                Application ID: ${appData.applicationId}
              </p>
            </div>
            ${footerHtml}
          </div>
        `
      };
    }

    case 'application_approved': {
      const appData = data as ApplicationEmailData;
      return {
        subject: `Congratulations! Scholarship Approved: ${appData.scholarshipTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            ${headerHtml}
            <div style="padding: 30px;">
              <h2 style="color: #22c55e; margin-top: 0;">Congratulations!</h2>
              <p style="color: #555; line-height: 1.6;">
                Hi ${appData.studentName},
              </p>
              <p style="color: #555; line-height: 1.6;">
                Great news! Your application for the <strong>${appData.scholarshipTitle}</strong> scholarship 
                has been <strong style="color: #22c55e;">approved</strong>.
              </p>
              <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #166534; margin: 0; font-size: 18px;">
                  Award Amount: <strong>$${appData.scholarshipAmount.toLocaleString()}</strong>
                </p>
              </div>
              <p style="color: #555; line-height: 1.6;">
                This amount will be applied to your financial aid package. 
                Visit your dashboard to see how this affects your remaining balance.
              </p>
              <div style="text-align: center;">
                <a href="${baseUrl}/student/financial-details" style="${buttonStyle}">
                  View Financial Details
                </a>
              </div>
            </div>
            ${footerHtml}
          </div>
        `
      };
    }

    case 'application_rejected': {
      const appData = data as ApplicationEmailData;
      return {
        subject: `Application Update: ${appData.scholarshipTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            ${headerHtml}
            <div style="padding: 30px;">
              <h2 style="color: #333; margin-top: 0;">Application Update</h2>
              <p style="color: #555; line-height: 1.6;">
                Hi ${appData.studentName},
              </p>
              <p style="color: #555; line-height: 1.6;">
                Thank you for applying to the <strong>${appData.scholarshipTitle}</strong> scholarship.
                After careful review, we regret to inform you that your application was not selected.
              </p>
              <p style="color: #555; line-height: 1.6;">
                Don't be discouraged - there are many other scholarship opportunities available. 
                Visit your dashboard to explore more options that match your profile.
              </p>
              <div style="text-align: center;">
                <a href="${baseUrl}/student/dashboard" style="${buttonStyle}">
                  Explore More Scholarships
                </a>
              </div>
            </div>
            ${footerHtml}
          </div>
        `
      };
    }

    case 'document_reminder': {
      const reminderData = data as ReminderEmailData;
      const itemsList = reminderData.pendingItems
        .map(item => `<li style="color: #555; padding: 5px 0;">${item}</li>`)
        .join('');
      
      return {
        subject: `Action Required: Complete Your Application for ${reminderData.scholarshipTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            ${headerHtml}
            <div style="padding: 30px;">
              <h2 style="color: #f59e0b; margin-top: 0;">Action Required</h2>
              <p style="color: #555; line-height: 1.6;">
                Hi ${reminderData.studentName},
              </p>
              <p style="color: #555; line-height: 1.6;">
                Your application for the <strong>${reminderData.scholarshipTitle}</strong> scholarship 
                is incomplete. Please complete the following items:
              </p>
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 15px 20px; border-radius: 8px; margin: 20px 0;">
                <ul style="margin: 0; padding-left: 20px;">
                  ${itemsList}
                </ul>
              </div>
              ${reminderData.deadline ? `
                <p style="color: #dc2626; font-weight: bold;">
                  Deadline: ${new Date(reminderData.deadline).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              ` : ''}
              <div style="text-align: center;">
                <a href="${baseUrl}/student/my-scholarships" style="${buttonStyle}">
                  Complete Application
                </a>
              </div>
            </div>
            ${footerHtml}
          </div>
        `
      };
    }

    case 'deadline_reminder': {
      const reminderData = data as ReminderEmailData;
      return {
        subject: `Deadline Approaching: ${reminderData.scholarshipTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            ${headerHtml}
            <div style="padding: 30px;">
              <h2 style="color: #dc2626; margin-top: 0;">Deadline Approaching</h2>
              <p style="color: #555; line-height: 1.6;">
                Hi ${reminderData.studentName},
              </p>
              <p style="color: #555; line-height: 1.6;">
                This is a friendly reminder that the deadline for the 
                <strong>${reminderData.scholarshipTitle}</strong> scholarship is approaching.
              </p>
              ${reminderData.deadline ? `
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <p style="color: #dc2626; margin: 0; font-size: 18px; font-weight: bold;">
                    Deadline: ${new Date(reminderData.deadline).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              ` : ''}
              <p style="color: #555; line-height: 1.6;">
                Make sure your application is complete before the deadline to be considered.
              </p>
              <div style="text-align: center;">
                <a href="${baseUrl}/student/my-scholarships" style="${buttonStyle}">
                  Review Application
                </a>
              </div>
            </div>
            ${footerHtml}
          </div>
        `
      };
    }

    case 'status_update': {
      const updateData = data as StatusUpdateEmailData;
      const updatesList = updateData.updates
        .map(update => `
          <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
            <p style="margin: 0 0 5px 0; font-weight: bold; color: #333;">${update.scholarshipTitle}</p>
            <p style="margin: 0; color: #666;">Status: <strong>${update.status}</strong></p>
            ${update.message ? `<p style="margin: 5px 0 0 0; color: #888; font-size: 14px;">${update.message}</p>` : ''}
          </div>
        `)
        .join('');
      
      return {
        subject: 'Your Weekly Scholarship Update',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            ${headerHtml}
            <div style="padding: 30px;">
              <h2 style="color: #333; margin-top: 0;">Your Application Updates</h2>
              <p style="color: #555; line-height: 1.6;">
                Hi ${updateData.studentName},
              </p>
              <p style="color: #555; line-height: 1.6;">
                Here's a summary of your scholarship application status:
              </p>
              <div style="background-color: #fafafa; border-radius: 8px; padding: 10px 20px; margin: 20px 0;">
                ${updatesList}
              </div>
              <div style="text-align: center;">
                <a href="${baseUrl}/student/my-scholarships" style="${buttonStyle}">
                  View All Applications
                </a>
              </div>
            </div>
            ${footerHtml}
          </div>
        `
      };
    }

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

/**
 * Sends an email notification
 */
export async function sendEmail(
  type: EmailType,
  data: ApplicationEmailData | ReminderEmailData | StatusUpdateEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { client, fromEmail } = await getResendClient();
    const { subject, html } = generateEmailHtml(type, data);
    
    // Get recipient email from data
    const toEmail = 'studentEmail' in data ? data.studentEmail : '';
    
    if (!toEmail) {
      return { success: false, error: 'No recipient email provided' };
    }

    const response = await client.emails.send({
      from: fromEmail || 'Clicky.e Scholarships <noreply@resend.dev>',
      to: toEmail,
      subject,
      html
    });

    if (response.error) {
      console.error('Resend error:', response.error);
      return { success: false, error: response.error.message };
    }

    console.log(`Email sent successfully: ${type} to ${toEmail}`);
    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Sends application submission confirmation
 */
export async function sendApplicationSubmittedEmail(
  studentName: string,
  studentEmail: string,
  scholarshipTitle: string,
  scholarshipAmount: number,
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail('application_submitted', {
    studentName,
    studentEmail,
    scholarshipTitle,
    scholarshipAmount,
    applicationId
  });
}

/**
 * Sends application approval notification
 */
export async function sendApplicationApprovedEmail(
  studentName: string,
  studentEmail: string,
  scholarshipTitle: string,
  scholarshipAmount: number,
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail('application_approved', {
    studentName,
    studentEmail,
    scholarshipTitle,
    scholarshipAmount,
    applicationId
  });
}

/**
 * Sends application rejection notification
 */
export async function sendApplicationRejectedEmail(
  studentName: string,
  studentEmail: string,
  scholarshipTitle: string,
  scholarshipAmount: number,
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail('application_rejected', {
    studentName,
    studentEmail,
    scholarshipTitle,
    scholarshipAmount,
    applicationId
  });
}

/**
 * Sends reminder for pending documents
 */
export async function sendDocumentReminderEmail(
  studentName: string,
  studentEmail: string,
  scholarshipTitle: string,
  pendingItems: string[],
  deadline: Date | undefined,
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail('document_reminder', {
    studentName,
    studentEmail,
    scholarshipTitle,
    pendingItems,
    deadline,
    applicationId
  });
}

/**
 * Sends deadline approaching reminder
 */
export async function sendDeadlineReminderEmail(
  studentName: string,
  studentEmail: string,
  scholarshipTitle: string,
  deadline: Date,
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail('deadline_reminder', {
    studentName,
    studentEmail,
    scholarshipTitle,
    pendingItems: [],
    deadline,
    applicationId
  });
}

/**
 * Sends periodic status update email
 */
export async function sendStatusUpdateEmail(
  studentName: string,
  studentEmail: string,
  updates: Array<{ scholarshipTitle: string; status: string; message?: string }>
): Promise<{ success: boolean; error?: string }> {
  return sendEmail('status_update', {
    studentName,
    studentEmail,
    updates
  });
}
