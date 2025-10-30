import { db } from "../db";
import { users, studentProfiles, scholarships, scholarshipApplications, type User, type InsertUser, type Scholarship, type InsertScholarship, type StudentProfile, type InsertStudentProfile, type ScholarshipApplication, type InsertScholarshipApplication } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

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
}

export const storage = new DbStorage();
