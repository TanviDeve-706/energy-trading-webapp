import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertEnergyOfferSchema, 
  insertEnergyTransactionSchema,
  insertEnergyGenerationSchema
} from "@shared/schema";
import { z } from "zod";

import bcrypt from "bcryptjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const walletConnectSchema = z.object({
  walletAddress: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Register request body:", req.body);
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Optionally return a token immediately after registration
      const token = jwt.sign(
        { id: user.id, username: user.username, userType: user.userType },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ 
        token,
        user: { id: user.id, username: user.username, userType: user.userType, walletAddress: null } 
      });
    } catch (error) {
      console.log("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login request body:", req.body);
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log("User not found:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare hashed password
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        console.log("Password mismatch for user:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Issue JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, userType: user.userType },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ 
        token,
        user: { id: user.id, username: user.username, userType: user.userType, walletAddress: user.walletAddress } 
      });
    } catch (error) {
      console.log("Login error:", error);
      res.status(400).json({ message: "Invalid login data", error });
    }
  });

  // Wallet routes
  app.post("/api/wallet/connect", async (req, res) => {
    try {
      const { walletAddress } = walletConnectSchema.parse(req.body);
      const userId = req.headers["user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      const user = await storage.updateUserWallet(userId, walletAddress);
      res.json({ user: { id: user.id, username: user.username, userType: user.userType, walletAddress: user.walletAddress } });
    } catch (error) {
      console.log("Wallet connect error:", error);
      res.status(400).json({ message: "Failed to connect wallet", error });
    }
  });

  // Energy offer routes
  app.get("/api/energy/offers", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offers = await storage.getEnergyOffers(limit);
      res.json({ offers });
    } catch (error) {
      console.log("Fetch offers error:", error);
      res.status(500).json({ message: "Failed to fetch offers", error });
    }
  });

  app.get("/api/energy/offers/:id", async (req, res) => {
    try {
      const offer = await storage.getEnergyOffer(req.params.id);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      res.json({ offer });
    } catch (error) {
      console.log("Fetch offer error:", error);
      res.status(500).json({ message: "Failed to fetch offer", error });
    }
  });

  app.post("/api/energy/offers", async (req, res) => {
    try {
      const offerData = insertEnergyOfferSchema.parse(req.body);
      const offer = await storage.createEnergyOffer(offerData);
      res.json({ offer });
    } catch (error) {
      console.log("Create offer error:", error);
      res.status(400).json({ message: "Invalid offer data", error });
    }
  });

  app.patch("/api/energy/offers/:id/status", async (req, res) => {
    try {
      const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
      const offer = await storage.updateOfferStatus(req.params.id, isActive);
      res.json({ offer });
    } catch (error) {
      console.log("Update offer status error:", error);
      res.status(400).json({ message: "Failed to update offer status", error });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getTransactions(userId, limit);
      res.json({ transactions });
    } catch (error) {
      console.log("Fetch transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions", error });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertEnergyTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.json({ transaction });
    } catch (error) {
      console.log("Create transaction error:", error);
      res.status(400).json({ message: "Invalid transaction data", error });
    }
  });

  app.patch("/api/transactions/:id/status", async (req, res) => {
    try {
      const { status, transactionHash, blockNumber } = z.object({
        status: z.string(),
        transactionHash: z.string().optional(),
        blockNumber: z.number().optional(),
      }).parse(req.body);
      
      const transaction = await storage.updateTransactionStatus(
        req.params.id, 
        status, 
        transactionHash, 
        blockNumber
      );
      res.json({ transaction });
    } catch (error) {
      console.log("Update transaction status error:", error);
      res.status(400).json({ message: "Failed to update transaction status", error });
    }
  });

  // Energy generation routes
  app.get("/api/energy/generation/:userId", async (req, res) => {
    try {
      const generation = await storage.getEnergyGeneration(req.params.userId);
      res.json({ generation });
    } catch (error) {
      console.log("Fetch generation error:", error);
      res.status(500).json({ message: "Failed to fetch energy generation data", error });
    }
  });

  app.post("/api/energy/generation", async (req, res) => {
    try {
      const generationData = insertEnergyGenerationSchema.parse(req.body);
      const generation = await storage.updateEnergyGeneration(generationData.userId, generationData);
      res.json({ generation });
    } catch (error) {
      console.log("Update generation error:", error);
      res.status(400).json({ message: "Invalid generation data", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
