import { db } from "../db";
import { users, studentProfiles, scholarships, type User, type InsertUser, type Scholarship, type InsertScholarship, type StudentProfile, type InsertStudentProfile } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Scholarship methods
  getScholarships(): Promise<Scholarship[]>;
  getScholarship(id: string): Promise<Scholarship | undefined>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;
  updateScholarship(id: string, scholarship: Partial<InsertScholarship>): Promise<Scholarship | undefined>;
  deleteScholarship(id: string): Promise<boolean>;

  // Student profile methods
  getStudentProfile(userId: string): Promise<StudentProfile | undefined>;
  createOrUpdateStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
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
}

export const storage = new DbStorage();
