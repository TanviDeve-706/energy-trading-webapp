import { 
  users,
  energyOffers,
  energyTransactions,
  energyGeneration,
  type User, 
  type InsertUser, 
  type EnergyOffer, 
  type InsertEnergyOffer,
  type EnergyTransaction,
  type InsertEnergyTransaction,
  type EnergyGeneration,
  type InsertEnergyGeneration
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(id: string, walletAddress: string): Promise<User>;

  // Energy offer methods
  getEnergyOffers(limit?: number): Promise<EnergyOffer[]>;
  getEnergyOffer(id: string): Promise<EnergyOffer | undefined>;
  getOffersBySeller(sellerId: string): Promise<EnergyOffer[]>;
  createEnergyOffer(offer: InsertEnergyOffer): Promise<EnergyOffer>;
  updateOfferStatus(id: string, isActive: boolean): Promise<EnergyOffer>;

  // Transaction methods
  getTransactions(userId?: string, limit?: number): Promise<EnergyTransaction[]>;
  createTransaction(transaction: InsertEnergyTransaction): Promise<EnergyTransaction>;
  updateTransactionStatus(id: string, status: string, transactionHash?: string, blockNumber?: number): Promise<EnergyTransaction>;

  // Energy generation methods
  getEnergyGeneration(userId: string): Promise<EnergyGeneration | undefined>;
  updateEnergyGeneration(userId: string, generation: InsertEnergyGeneration): Promise<EnergyGeneration>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        walletAddress: insertUser.walletAddress || null,
        userType: insertUser.userType || "consumer",
      })
      .returning();
    return user;
  }

  async updateUserWallet(id: string, walletAddress: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ walletAddress })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) throw new Error("User not found");
    return user;
  }

  async getEnergyOffers(limit = 50): Promise<EnergyOffer[]> {
    const offers = await db
      .select()
      .from(energyOffers)
      .where(eq(energyOffers.isActive, true))
      .orderBy(desc(energyOffers.createdAt))
      .limit(limit);
    return offers;
  }

  async getEnergyOffer(id: string): Promise<EnergyOffer | undefined> {
    const [offer] = await db.select().from(energyOffers).where(eq(energyOffers.id, id));
    return offer || undefined;
  }

  async getOffersBySeller(sellerId: string): Promise<EnergyOffer[]> {
    const offers = await db
      .select()
      .from(energyOffers)
      .where(eq(energyOffers.sellerId, sellerId));
    return offers;
  }

  async createEnergyOffer(insertOffer: InsertEnergyOffer): Promise<EnergyOffer> {
    const [offer] = await db
      .insert(energyOffers)
      .values({
        ...insertOffer,
        location: insertOffer.location || null,
        isActive: true,
        contractAddress: null,
        transactionHash: null,
      })
      .returning();
    return offer;
  }

  async updateOfferStatus(id: string, isActive: boolean): Promise<EnergyOffer> {
    const [offer] = await db
      .update(energyOffers)
      .set({ isActive })
      .where(eq(energyOffers.id, id))
      .returning();
    
    if (!offer) throw new Error("Offer not found");
    return offer;
  }

  async getTransactions(userId?: string, limit = 50): Promise<EnergyTransaction[]> {
    if (userId) {
      const transactions = await db
        .select()
        .from(energyTransactions)
        .where(or(
          eq(energyTransactions.buyerId, userId),
          eq(energyTransactions.sellerId, userId)
        ))
        .orderBy(desc(energyTransactions.createdAt))
        .limit(limit);
      return transactions;
    }

    const transactions = await db
      .select()
      .from(energyTransactions)
      .orderBy(desc(energyTransactions.createdAt))
      .limit(limit);
    
    return transactions;
  }

  async createTransaction(insertTransaction: InsertEnergyTransaction): Promise<EnergyTransaction> {
    const [transaction] = await db
      .insert(energyTransactions)
      .values({
        ...insertTransaction,
        status: "pending",
        transactionHash: insertTransaction.transactionHash || null,
        blockNumber: insertTransaction.blockNumber || null,
      })
      .returning();
    return transaction;
  }

  async updateTransactionStatus(
    id: string, 
    status: string, 
    transactionHash?: string, 
    blockNumber?: number
  ): Promise<EnergyTransaction> {
    const [transaction] = await db
      .update(energyTransactions)
      .set({
        status,
        transactionHash: transactionHash || null,
        blockNumber: blockNumber || null,
      })
      .where(eq(energyTransactions.id, id))
      .returning();
    
    if (!transaction) throw new Error("Transaction not found");
    return transaction;
  }

  async getEnergyGeneration(userId: string): Promise<EnergyGeneration | undefined> {
    const [generation] = await db
      .select()
      .from(energyGeneration)
      .where(eq(energyGeneration.userId, userId));
    return generation || undefined;
  }

  async updateEnergyGeneration(userId: string, insertGeneration: InsertEnergyGeneration): Promise<EnergyGeneration> {
    const existing = await this.getEnergyGeneration(userId);
    
    if (existing) {
      const [updated] = await db
        .update(energyGeneration)
        .set({
          ...insertGeneration,
          userId,
        })
        .where(eq(energyGeneration.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(energyGeneration)
        .values({
          ...insertGeneration,
          userId,
        })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();