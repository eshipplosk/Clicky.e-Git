import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScholarshipSchema, insertUserSchema, insertApplicationDocumentSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { getScholarshipAssistantResponse } from "./aiAssistant";
import { z } from "zod";
import { compareRequirements } from "./requirementChecker";
import { 
  sendApplicationSubmittedEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendDocumentReminderEmail,
  sendDeadlineReminderEmail,
  sendStatusUpdateEmail
} from "./emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware to check if user is logged in
  function requireAuth(req: any, res: any, next: any) {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  }

  // Auth middleware to check if user is admin
  async function requireAdmin(req: any, res: any, next: any) {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }
    next();
  }

  // Get current user
  app.get("/api/user", async (req, res) => {
    if (!req.session?.userId) {
      return res.json(null);
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.json(null);
      }
      
      // For students, try to get name from their profile
      let firstName = user.firstName;
      let lastName = user.lastName;
      
      if (user.role === 'student') {
        const profile = await storage.getStudentProfile(user.id);
        if (profile) {
          firstName = profile.firstName;
          lastName = profile.lastName;
        }
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ ...userWithoutPassword, firstName, lastName });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      // Check if username already exists
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Check if this is the first user (will be admin)
      const userCount = await storage.getUserCount();
      const role = userCount === 0 ? 'admin' : 'student';

      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role,
      });

      // Set session
      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ ...userWithoutPassword, firstName: user.firstName, lastName: user.lastName });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;

      // For students, try to get name from their profile
      let firstName = user.firstName;
      let lastName = user.lastName;
      
      if (user.role === 'student') {
        const profile = await storage.getStudentProfile(user.id);
        if (profile) {
          firstName = profile.firstName;
          lastName = profile.lastName;
        }
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ ...userWithoutPassword, firstName, lastName });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  // User management routes (admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      if (!['admin', 'student'].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      // Prevent demoting the last admin
      if (role === 'student') {
        const allUsers = await storage.getAllUsers();
        const adminCount = allUsers.filter(u => u.role === 'admin').length;
        
        // Check if the user being demoted is an admin
        const targetUser = await storage.getUser(req.params.id);
        if (targetUser?.role === 'admin' && adminCount === 1) {
          return res.status(400).json({ error: "Cannot remove the last administrator" });
        }
      }

      const user = await storage.updateUserRole(req.params.id, role);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // Scholarship routes
  app.get("/api/scholarships", async (req, res) => {
    try {
      const scholarships = await storage.getScholarships();
      res.json(scholarships);
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      res.status(500).json({ error: "Failed to fetch scholarships" });
    }
  });

  app.get("/api/scholarships/:id", async (req, res) => {
    try {
      const scholarship = await storage.getScholarship(req.params.id);
      if (!scholarship) {
        return res.status(404).json({ error: "Scholarship not found" });
      }
      res.json(scholarship);
    } catch (error) {
      console.error("Error fetching scholarship:", error);
      res.status(500).json({ error: "Failed to fetch scholarship" });
    }
  });

  app.post("/api/scholarships", requireAdmin, async (req, res) => {
    try {
      // Convert deadline string to Date if needed
      const data = {
        ...req.body,
        deadline: typeof req.body.deadline === 'string' ? new Date(req.body.deadline) : req.body.deadline
      };
      const validated = insertScholarshipSchema.parse(data);
      const scholarship = await storage.createScholarship(validated);
      res.json(scholarship);
    } catch (error) {
      console.error("Error creating scholarship:", error);
      res.status(400).json({ error: "Invalid scholarship data" });
    }
  });

  app.patch("/api/scholarships/:id", requireAdmin, async (req, res) => {
    try {
      const scholarship = await storage.updateScholarship(req.params.id, req.body);
      if (!scholarship) {
        return res.status(404).json({ error: "Scholarship not found" });
      }
      res.json(scholarship);
    } catch (error) {
      console.error("Error updating scholarship:", error);
      res.status(400).json({ error: "Failed to update scholarship" });
    }
  });

  app.delete("/api/scholarships/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteScholarship(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Scholarship not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting scholarship:", error);
      res.status(500).json({ error: "Failed to delete scholarship" });
    }
  });

  // Student profile routes
  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getStudentProfile(req.session.userId!);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", requireAuth, async (req, res) => {
    try {
      // Helper to convert string to number or null
      const toNumber = (value: any) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };

      // Extract and convert fields, excluding id, createdAt, updatedAt
      const { id, createdAt, updatedAt, ...bodyData } = req.body;
      
      const cleanedData = {
        ...bodyData,
        userId: req.session.userId!,
        // Convert numeric fields from strings to numbers
        gpa: toNumber(bodyData.gpa),
        actScore: toNumber(bodyData.actScore),
        satScore: toNumber(bodyData.satScore),
        lsatScore: toNumber(bodyData.lsatScore),
        greScore: toNumber(bodyData.greScore),
        volunteerHours: toNumber(bodyData.volunteerHours),
        tuitionAmount: toNumber(bodyData.tuitionAmount),
        housingCost: toNumber(bodyData.housingCost),
        feesCost: toNumber(bodyData.feesCost),
        diningCost: toNumber(bodyData.diningCost),
        booksCost: toNumber(bodyData.booksCost),
        personalCost: toNumber(bodyData.personalCost),
        transportationCost: toNumber(bodyData.transportationCost),
        grantsAmount: toNumber(bodyData.grantsAmount),
        loansAmount: toNumber(bodyData.loansAmount),
      };
      
      const profile = await storage.createOrUpdateStudentProfile(cleanedData);
      res.json(profile);
    } catch (error) {
      console.error("Error saving profile:", error);
      res.status(500).json({ error: "Failed to save profile" });
    }
  });

  // Scholarship application routes
  app.get("/api/scholarship-applications", requireAuth, async (req, res) => {
    try {
      const acceptedScholarships = await storage.getAcceptedScholarshipsWithDetails(req.session.userId!);
      res.json(acceptedScholarships);
    } catch (error) {
      console.error("Error fetching scholarship applications:", error);
      res.status(500).json({ error: "Failed to fetch scholarship applications" });
    }
  });

  app.post("/api/scholarship-applications", requireAuth, async (req, res) => {
    try {
      const { scholarshipId } = req.body;
      if (!scholarshipId) {
        return res.status(400).json({ error: "Scholarship ID is required" });
      }
      const application = await storage.acceptScholarship(req.session.userId!, scholarshipId);
      
      // Send confirmation email if profile exists and has email notifications enabled
      const profile = await storage.getStudentProfile(req.session.userId!);
      const scholarship = await storage.getScholarship(scholarshipId);
      
      if (profile && scholarship && profile.emailNotifications !== false && profile.emailApplicationUpdates !== false) {
        // Send email asynchronously (don't block the response)
        sendApplicationSubmittedEmail(
          `${profile.firstName} ${profile.lastName}`,
          profile.email,
          scholarship.title,
          scholarship.amount,
          application.id
        ).catch(err => console.error('Failed to send application confirmation email:', err));
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error accepting scholarship:", error);
      res.status(500).json({ error: "Failed to accept scholarship" });
    }
  });

  app.delete("/api/scholarship-applications/:scholarshipId", requireAuth, async (req, res) => {
    try {
      const success = await storage.removeScholarshipApplication(req.session.userId!, req.params.scholarshipId);
      if (!success) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing scholarship application:", error);
      res.status(500).json({ error: "Failed to remove scholarship application" });
    }
  });

  // Get detailed application information with requirements and documents
  app.get("/api/scholarship-applications/:scholarshipId/details", requireAuth, async (req, res) => {
    try {
      const { scholarshipId } = req.params;
      
      // Get scholarship
      const scholarship = await storage.getScholarship(scholarshipId);
      if (!scholarship) {
        return res.status(404).json({ error: "Scholarship not found" });
      }

      // Get student profile
      const profile = await storage.getStudentProfile(req.session.userId!);

      // Get application
      const application = await storage.getScholarshipApplication(req.session.userId!, scholarshipId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Compare requirements
      const requirements = compareRequirements(scholarship, profile || null);

      // Get documents
      const documents = await storage.getApplicationDocuments(application.id);

      // Create document checklist from required documents
      const requiredDocs = scholarship.requiredDocuments || [];
      const documentChecklist = requiredDocs.map(docType => {
        const uploadedDoc = documents.find(d => d.documentType === docType);
        return {
          documentType: docType,
          status: uploadedDoc?.status || 'pending',
          fileName: uploadedDoc?.fileName || null,
          rejectionReason: uploadedDoc?.rejectionReason || null,
          uploadedAt: uploadedDoc?.uploadedAt || null,
          deadline: uploadedDoc?.deadline || null,
          id: uploadedDoc?.id || null
        };
      });

      res.json({
        scholarship,
        application,
        profile,
        requirements,
        documentChecklist
      });
    } catch (error) {
      console.error("Error fetching application details:", error);
      res.status(500).json({ error: "Failed to fetch application details" });
    }
  });

  // Get documents for an application
  app.get("/api/application-documents/:applicationId", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getApplicationDocuments(req.params.applicationId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching application documents:", error);
      res.status(500).json({ error: "Failed to fetch application documents" });
    }
  });

  // Create or update application document
  app.post("/api/application-documents", requireAuth, async (req, res) => {
    try {
      const validatedData = insertApplicationDocumentSchema.parse(req.body);
      const document = await storage.createApplicationDocument(validatedData);
      res.json(document);
    } catch (error) {
      console.error("Error creating application document:", error);
      res.status(500).json({ error: "Failed to create application document" });
    }
  });

  // Update application document
  app.patch("/api/application-documents/:id", requireAuth, async (req, res) => {
    try {
      const document = await storage.updateApplicationDocument(req.params.id, req.body);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error updating application document:", error);
      res.status(500).json({ error: "Failed to update application document" });
    }
  });

  // Financial aid summary route
  app.get("/api/financial-aid-summary", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getStudentProfile(req.session.userId!);
      const acceptedScholarships = await storage.getAcceptedScholarshipsWithDetails(req.session.userId!);
      
      const tuitionAmount = profile?.tuitionAmount || 0;
      const totalScholarships = acceptedScholarships.reduce((sum, s) => sum + s.amount, 0);
      const loanEligible = Math.max(0, tuitionAmount - totalScholarships);
      
      res.json({
        tuitionAmount,
        totalScholarships,
        loanEligible,
        acceptedScholarships
      });
    } catch (error) {
      console.error("Error fetching financial aid summary:", error);
      res.status(500).json({ error: "Failed to fetch financial aid summary" });
    }
  });

  // AI Assistant chat endpoint
  const chatMessageSchema = z.object({
    messages: z.array(z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string()
    }))
  });

  app.post("/api/ai-assistant/chat", requireAuth, async (req, res) => {
    try {
      const { messages } = chatMessageSchema.parse(req.body);
      
      // Get student profile for context
      const profile = await storage.getStudentProfile(req.session.userId!);
      
      // Get all active scholarships
      const scholarships = await storage.getScholarships();
      const activeScholarships = scholarships.filter(s => s.status === 'active');
      
      // Get AI response
      const response = await getScholarshipAssistantResponse(
        messages,
        profile || null,
        activeScholarships
      );
      
      res.json({ message: response });
    } catch (error: any) {
      console.error("Error in AI assistant:", error);
      res.status(500).json({ 
        error: error.message || "Failed to get AI response" 
      });
    }
  });

  // Admin endpoint to update application status (approve/reject)
  app.patch("/api/admin/applications/:applicationId/status", requireAdmin, async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status } = req.body;
      
      if (!['accepted', 'pending', 'declined', 'approved'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const application = await storage.updateScholarshipApplicationStatus(applicationId, status);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Get student profile and scholarship for email notification
      const profile = await storage.getStudentProfileByUserId(application.userId);
      const scholarship = await storage.getScholarship(application.scholarshipId);

      if (profile && scholarship && profile.emailNotifications !== false && profile.emailApplicationUpdates !== false) {
        if (status === 'approved' || status === 'accepted') {
          sendApplicationApprovedEmail(
            `${profile.firstName} ${profile.lastName}`,
            profile.email,
            scholarship.title,
            scholarship.amount,
            application.id
          ).catch(err => console.error('Failed to send approval email:', err));
        } else if (status === 'declined') {
          sendApplicationRejectedEmail(
            `${profile.firstName} ${profile.lastName}`,
            profile.email,
            scholarship.title,
            scholarship.amount,
            application.id
          ).catch(err => console.error('Failed to send rejection email:', err));
        }
      }

      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ error: "Failed to update application status" });
    }
  });

  // Email preferences validation schema
  const emailPreferencesSchema = z.object({
    emailNotifications: z.boolean().optional(),
    emailApplicationUpdates: z.boolean().optional(),
    emailDeadlineReminders: z.boolean().optional(),
    emailWeeklyDigest: z.boolean().optional(),
  });

  // Update email notification preferences
  app.patch("/api/profile/email-preferences", requireAuth, async (req, res) => {
    try {
      const validated = emailPreferencesSchema.parse(req.body);
      
      const profile = await storage.updateStudentProfileEmailPreferences(req.session.userId!, validated);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid email preferences data", details: error.errors });
      }
      console.error("Error updating email preferences:", error);
      res.status(500).json({ error: "Failed to update email preferences" });
    }
  });

  // Send document reminder email (admin or automated trigger)
  app.post("/api/admin/send-reminder", requireAdmin, async (req, res) => {
    try {
      const { userId, scholarshipId, pendingItems } = req.body;
      
      const profile = await storage.getStudentProfileByUserId(userId);
      const scholarship = await storage.getScholarship(scholarshipId);
      const application = await storage.getScholarshipApplication(userId, scholarshipId);
      
      if (!profile || !scholarship || !application) {
        return res.status(404).json({ error: "Profile, scholarship, or application not found" });
      }
      
      if (profile.emailNotifications === false || profile.emailDeadlineReminders === false) {
        return res.json({ success: false, message: "User has disabled reminder emails" });
      }
      
      const result = await sendDocumentReminderEmail(
        `${profile.firstName} ${profile.lastName}`,
        profile.email,
        scholarship.title,
        pendingItems || [],
        scholarship.deadline,
        application.id
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ error: "Failed to send reminder" });
    }
  });

  // Get all applications for admin
  app.get("/api/admin/applications", requireAdmin, async (req, res) => {
    try {
      const applications = await storage.getAllApplicationsWithDetails();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching all applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
