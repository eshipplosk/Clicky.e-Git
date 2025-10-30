import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScholarshipSchema, insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";

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
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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
      res.json(userWithoutPassword);
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

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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
      const validated = insertScholarshipSchema.parse(req.body);
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
      // Transform empty strings to null for numeric fields
      const cleanedData = {
        ...req.body,
        userId: req.session.userId!,
        gpa: req.body.gpa === '' ? null : req.body.gpa,
        actScore: req.body.actScore === '' ? null : req.body.actScore,
        satScore: req.body.satScore === '' ? null : req.body.satScore,
        lsatScore: req.body.lsatScore === '' ? null : req.body.lsatScore,
        greScore: req.body.greScore === '' ? null : req.body.greScore,
        volunteerHours: req.body.volunteerHours === '' ? null : req.body.volunteerHours,
        tuitionAmount: req.body.tuitionAmount === '' ? null : req.body.tuitionAmount,
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

  const httpServer = createServer(app);
  return httpServer;
}
