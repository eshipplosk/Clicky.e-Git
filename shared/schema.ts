import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // 'student' or 'admin'
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
});

export const studentProfiles = pgTable("student_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  major: text("major"),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  actScore: integer("act_score"),
  satScore: integer("sat_score"),
  lsatScore: integer("lsat_score"),
  greScore: integer("gre_score"),
  academicYear: text("academic_year"),
  ethnicity: text("ethnicity"),
  gender: text("gender"),
  firstGeneration: boolean("first_generation").default(false),
  veteran: boolean("veteran").default(false),
  disability: boolean("disability").default(false),
  extracurriculars: text("extracurriculars").array(),
  skills: text("skills").array(),
  volunteerHours: integer("volunteer_hours"),
  leadershipRoles: text("leadership_roles").array(),
  financialNeed: text("financial_need"),
  tuitionAmount: integer("tuition_amount"),
  housingCost: integer("housing_cost"),
  feesCost: integer("fees_cost"),
  diningCost: integer("dining_cost"),
  booksCost: integer("books_cost"),
  personalCost: integer("personal_cost"),
  transportationCost: integer("transportation_cost"),
  grantsAmount: integer("grants_amount"),
  loansAmount: integer("loans_amount"),
  emailNotifications: boolean("email_notifications").default(true),
  emailApplicationUpdates: boolean("email_application_updates").default(true),
  emailDeadlineReminders: boolean("email_deadline_reminders").default(true),
  emailWeeklyDigest: boolean("email_weekly_digest").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scholarships = pgTable("scholarships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  deadline: timestamp("deadline").notNull(),
  category: text("category").notNull(),
  eligibility: text("eligibility").notNull(),
  minGPA: decimal("min_gpa", { precision: 3, scale: 2 }),
  minACT: integer("min_act"),
  minSAT: integer("min_sat"),
  minLSAT: integer("min_lsat"),
  minGRE: integer("min_gre"),
  ethnicityRequirements: text("ethnicity_requirements").array(),
  requiresFirstGen: boolean("requires_first_gen").default(false),
  requiresVeteran: boolean("requires_veteran").default(false),
  requiresDisability: boolean("requires_disability").default(false),
  majorRequirements: text("major_requirements").array(),
  skillRequirements: text("skill_requirements").array(),
  minVolunteerHours: integer("min_volunteer_hours"),
  requiresEssay: boolean("requires_essay").default(false),
  requiredDocuments: text("required_documents").array(), // List of required document types
  status: text("status").notNull().default("active"), // 'active', 'draft', 'closed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scholarshipApplications = pgTable("scholarship_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  scholarshipId: varchar("scholarship_id").notNull().references(() => scholarships.id),
  status: text("status").notNull().default("accepted"), // 'accepted', 'pending', 'declined'
  appliedAt: timestamp("applied_at").defaultNow(),
});

export const applicationDocuments = pgTable("application_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull().references(() => scholarshipApplications.id),
  documentType: text("document_type").notNull(), // e.g., 'essay', 'transcript', 'recommendation'
  fileName: text("file_name"),
  fileUrl: text("file_url"),
  status: text("status").notNull().default("pending"), // 'uploaded', 'pending', 'rejected'
  rejectionReason: text("rejection_reason"),
  uploadedAt: timestamp("uploaded_at"),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notification issue types
export const notificationTypes = {
  MISSING_PROFILE_FIELDS: 'missing_profile_fields',
  MISSING_DOCUMENTS: 'missing_documents',
  INVALID_DOCUMENTS: 'invalid_documents',
  DEADLINE_APPROACHING: 'deadline_approaching',
  APPLICATION_APPROVED: 'application_approved',
  APPLICATION_DENIED: 'application_denied',
  SCHOLARSHIP_UPDATED: 'scholarship_updated',
  TECHNICAL_ERROR: 'technical_error',
  DOCUMENT_REJECTED: 'document_rejected',
  APPLICATION_INCOMPLETE: 'application_incomplete',
} as const;

export type NotificationType = typeof notificationTypes[keyof typeof notificationTypes];

// Notification priority levels
export const notificationPriorities = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type NotificationPriority = typeof notificationPriorities[keyof typeof notificationPriorities];

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // One of notificationTypes
  title: text("title").notNull(),
  message: text("message").notNull(),
  actionText: text("action_text"), // e.g., "Complete Profile", "Upload Document"
  actionUrl: text("action_url"), // e.g., "/student/profile", "/student/applications"
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  isRead: boolean("is_read").default(false),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  sendEmail: boolean("send_email").default(false),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  relatedEntityType: text("related_entity_type"), // 'scholarship', 'application', 'document', 'profile'
  relatedEntityId: varchar("related_entity_id"),
  metadata: text("metadata"), // JSON string for additional data
  expiresAt: timestamp("expires_at"), // Optional expiration for time-sensitive notifications
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportMessages = pgTable("support_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  category: text("category").notNull().default("general"), // 'general', 'scholarship', 'financial', 'technical'
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'answered', 'closed'
  priority: text("priority").notNull().default("normal"), // 'low', 'normal', 'high'
  adminId: varchar("admin_id").references(() => users.id), // Admin who responded
  adminReply: text("admin_reply"),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScholarshipApplicationSchema = createInsertSchema(scholarshipApplications).omit({
  id: true,
  appliedAt: true,
});

export const insertApplicationDocumentSchema = createInsertSchema(applicationDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertSupportMessageSchema = createInsertSchema(supportMessages).omit({
  id: true,
  adminId: true,
  adminReply: true,
  repliedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;

export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type Scholarship = typeof scholarships.$inferSelect;

export type InsertScholarshipApplication = z.infer<typeof insertScholarshipApplicationSchema>;
export type ScholarshipApplication = typeof scholarshipApplications.$inferSelect;

export type InsertApplicationDocument = z.infer<typeof insertApplicationDocumentSchema>;
export type ApplicationDocument = typeof applicationDocuments.$inferSelect;

export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type SupportMessage = typeof supportMessages.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
