import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScholarshipSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.post("/api/scholarships", async (req, res) => {
    try {
      const validated = insertScholarshipSchema.parse(req.body);
      const scholarship = await storage.createScholarship(validated);
      res.json(scholarship);
    } catch (error) {
      console.error("Error creating scholarship:", error);
      res.status(400).json({ error: "Invalid scholarship data" });
    }
  });

  app.patch("/api/scholarships/:id", async (req, res) => {
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

  app.delete("/api/scholarships/:id", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
