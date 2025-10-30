import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // 'student' or 'admin'
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;

export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;
export type Scholarship = typeof scholarships.$inferSelect;

export type InsertScholarshipApplication = z.infer<typeof insertScholarshipApplicationSchema>;
export type ScholarshipApplication = typeof scholarshipApplications.$inferSelect;
