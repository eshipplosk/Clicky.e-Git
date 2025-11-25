import { db } from "../db";
import { users, studentProfiles, scholarships, scholarshipApplications, applicationDocuments, supportMessages, type User, type InsertUser, type Scholarship, type InsertScholarship, type StudentProfile, type InsertStudentProfile, type ScholarshipApplication, type InsertScholarshipApplication, type ApplicationDocument, type InsertApplicationDocument, type SupportMessage, type InsertSupportMessage } from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserCount(): Promise<number>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;

  // Scholarship methods
  getScholarships(): Promise<Scholarship[]>;
  getScholarship(id: string): Promise<Scholarship | undefined>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;
  updateScholarship(id: string, scholarship: Partial<InsertScholarship>): Promise<Scholarship | undefined>;
  deleteScholarship(id: string): Promise<boolean>;

  // Student profile methods
  getStudentProfile(userId: string): Promise<StudentProfile | undefined>;
  createOrUpdateStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;

  // Scholarship application methods
  getScholarshipApplications(userId: string): Promise<ScholarshipApplication[]>;
  acceptScholarship(userId: string, scholarshipId: string): Promise<ScholarshipApplication>;
  removeScholarshipApplication(userId: string, scholarshipId: string): Promise<boolean>;
  getAcceptedScholarshipsWithDetails(userId: string): Promise<Array<Scholarship & { applicationId: string }>>;
  getScholarshipApplication(userId: string, scholarshipId: string): Promise<ScholarshipApplication | undefined>;

  // Application document methods
  getApplicationDocuments(applicationId: string): Promise<ApplicationDocument[]>;
  createApplicationDocument(document: InsertApplicationDocument): Promise<ApplicationDocument>;
  updateApplicationDocument(id: string, document: Partial<InsertApplicationDocument>): Promise<ApplicationDocument | undefined>;

  // Support message methods
  getSupportMessages(studentId: string): Promise<SupportMessage[]>;
  getAllSupportMessages(): Promise<SupportMessage[]>;
  getSupportMessage(id: string): Promise<SupportMessage | undefined>;
  createSupportMessage(message: InsertSupportMessage): Promise<SupportMessage>;
  replySupportMessage(id: string, adminId: string, adminReply: string): Promise<SupportMessage | undefined>;
  updateSupportMessageStatus(id: string, status: string): Promise<SupportMessage | undefined>;
}

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getUserCount(): Promise<number> {
    const result = await db.select().from(users);
    return result.length;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Scholarship methods
  async getScholarships(): Promise<Scholarship[]> {
    return await db.select().from(scholarships).where(eq(scholarships.status, "active"));
  }

  async getScholarship(id: string): Promise<Scholarship | undefined> {
    const result = await db.select().from(scholarships).where(eq(scholarships.id, id));
    return result[0];
  }

  async createScholarship(scholarship: InsertScholarship): Promise<Scholarship> {
    const result = await db.insert(scholarships).values(scholarship).returning();
    return result[0];
  }

  async updateScholarship(id: string, scholarship: Partial<InsertScholarship>): Promise<Scholarship | undefined> {
    const result = await db.update(scholarships)
      .set({ ...scholarship, updatedAt: new Date() })
      .where(eq(scholarships.id, id))
      .returning();
    return result[0];
  }

  async deleteScholarship(id: string): Promise<boolean> {
    const result = await db.delete(scholarships).where(eq(scholarships.id, id)).returning();
    return result.length > 0;
  }

  // Student profile methods
  async getStudentProfile(userId: string): Promise<StudentProfile | undefined> {
    const result = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId));
    return result[0];
  }

  async createOrUpdateStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    // Check if profile exists
    const existing = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, profile.userId));
    
    if (existing.length > 0) {
      // Update existing
      const result = await db.update(studentProfiles)
        .set({ ...profile, updatedAt: new Date() })
        .where(eq(studentProfiles.userId, profile.userId))
        .returning();
      return result[0];
    } else {
      // Create new
      const result = await db.insert(studentProfiles).values(profile).returning();
      return result[0];
    }
  }

  // Scholarship application methods
  async getScholarshipApplications(userId: string): Promise<ScholarshipApplication[]> {
    return await db.select().from(scholarshipApplications).where(eq(scholarshipApplications.userId, userId));
  }

  async acceptScholarship(userId: string, scholarshipId: string): Promise<ScholarshipApplication> {
    // Check if already accepted
    const existing = await db.select().from(scholarshipApplications)
      .where(and(
        eq(scholarshipApplications.userId, userId),
        eq(scholarshipApplications.scholarshipId, scholarshipId)
      ));
    
    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(scholarshipApplications).values({
      userId,
      scholarshipId,
      status: "accepted"
    }).returning();
    return result[0];
  }

  async removeScholarshipApplication(userId: string, scholarshipId: string): Promise<boolean> {
    const result = await db.delete(scholarshipApplications)
      .where(and(
        eq(scholarshipApplications.userId, userId),
        eq(scholarshipApplications.scholarshipId, scholarshipId)
      ))
      .returning();
    return result.length > 0;
  }

  async getAcceptedScholarshipsWithDetails(userId: string): Promise<Array<Scholarship & { applicationId: string }>> {
    const result = await db
      .select({
        id: scholarships.id,
        title: scholarships.title,
        description: scholarships.description,
        amount: scholarships.amount,
        deadline: scholarships.deadline,
        category: scholarships.category,
        eligibility: scholarships.eligibility,
        minGPA: scholarships.minGPA,
        minACT: scholarships.minACT,
        minSAT: scholarships.minSAT,
        minLSAT: scholarships.minLSAT,
        minGRE: scholarships.minGRE,
        ethnicityRequirements: scholarships.ethnicityRequirements,
        requiresFirstGen: scholarships.requiresFirstGen,
        requiresVeteran: scholarships.requiresVeteran,
        requiresDisability: scholarships.requiresDisability,
        majorRequirements: scholarships.majorRequirements,
        skillRequirements: scholarships.skillRequirements,
        minVolunteerHours: scholarships.minVolunteerHours,
        requiresEssay: scholarships.requiresEssay,
        requiredDocuments: scholarships.requiredDocuments,
        status: scholarships.status,
        createdAt: scholarships.createdAt,
        updatedAt: scholarships.updatedAt,
        applicationId: scholarshipApplications.id,
      })
      .from(scholarshipApplications)
      .innerJoin(scholarships, eq(scholarshipApplications.scholarshipId, scholarships.id))
      .where(and(
        eq(scholarshipApplications.userId, userId),
        eq(scholarshipApplications.status, "accepted")
      ));
    
    return result;
  }

  async getScholarshipApplication(userId: string, scholarshipId: string): Promise<ScholarshipApplication | undefined> {
    const result = await db.select().from(scholarshipApplications)
      .where(and(
        eq(scholarshipApplications.userId, userId),
        eq(scholarshipApplications.scholarshipId, scholarshipId)
      ));
    return result[0];
  }

  // Application document methods
  async getApplicationDocuments(applicationId: string): Promise<ApplicationDocument[]> {
    return await db.select().from(applicationDocuments).where(eq(applicationDocuments.applicationId, applicationId));
  }

  async createApplicationDocument(document: InsertApplicationDocument): Promise<ApplicationDocument> {
    const result = await db.insert(applicationDocuments).values(document).returning();
    return result[0];
  }

  async updateApplicationDocument(id: string, document: Partial<InsertApplicationDocument>): Promise<ApplicationDocument | undefined> {
    const result = await db.update(applicationDocuments)
      .set(document)
      .where(eq(applicationDocuments.id, id))
      .returning();
    return result[0];
  }

  // Support message methods
  async getSupportMessages(studentId: string): Promise<SupportMessage[]> {
    return await db.select().from(supportMessages)
      .where(eq(supportMessages.studentId, studentId))
      .orderBy(desc(supportMessages.createdAt));
  }

  async getAllSupportMessages(): Promise<SupportMessage[]> {
    return await db.select().from(supportMessages)
      .orderBy(desc(supportMessages.createdAt));
  }

  async getSupportMessage(id: string): Promise<SupportMessage | undefined> {
    const result = await db.select().from(supportMessages).where(eq(supportMessages.id, id));
    return result[0];
  }

  async createSupportMessage(message: InsertSupportMessage): Promise<SupportMessage> {
    const result = await db.insert(supportMessages).values(message).returning();
    return result[0];
  }

  async replySupportMessage(id: string, adminId: string, adminReply: string): Promise<SupportMessage | undefined> {
    const result = await db.update(supportMessages)
      .set({ 
        adminId, 
        adminReply, 
        status: "answered",
        repliedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(supportMessages.id, id))
      .returning();
    return result[0];
  }

  async updateSupportMessageStatus(id: string, status: string): Promise<SupportMessage | undefined> {
    const result = await db.update(supportMessages)
      .set({ status, updatedAt: new Date() })
      .where(eq(supportMessages.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
