import { 
  type User, 
  type InsertUser, 
  type EnergyOffer, 
  type InsertEnergyOffer,
  type EnergyTransaction,
  type InsertEnergyTransaction,
  type EnergyGeneration,
  type InsertEnergyGeneration
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private energyOffers: Map<string, EnergyOffer>;
  private energyTransactions: Map<string, EnergyTransaction>;
  private energyGeneration: Map<string, EnergyGeneration>;

  constructor() {
    this.users = new Map();
    this.energyOffers = new Map();
    this.energyTransactions = new Map();
    this.energyGeneration = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserWallet(id: string, walletAddress: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, walletAddress };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getEnergyOffers(limit = 50): Promise<EnergyOffer[]> {
    return Array.from(this.energyOffers.values())
      .filter(offer => offer.isActive)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async getEnergyOffer(id: string): Promise<EnergyOffer | undefined> {
    return this.energyOffers.get(id);
  }

  async getOffersBySeller(sellerId: string): Promise<EnergyOffer[]> {
    return Array.from(this.energyOffers.values()).filter(
      (offer) => offer.sellerId === sellerId,
    );
  }

  async createEnergyOffer(insertOffer: InsertEnergyOffer): Promise<EnergyOffer> {
    const id = randomUUID();
    const offer: EnergyOffer = { 
      ...insertOffer, 
      id,
      isActive: true,
      createdAt: new Date()
    };
    this.energyOffers.set(id, offer);
    return offer;
  }

  async updateOfferStatus(id: string, isActive: boolean): Promise<EnergyOffer> {
    const offer = this.energyOffers.get(id);
    if (!offer) throw new Error("Offer not found");
    
    const updatedOffer = { ...offer, isActive };
    this.energyOffers.set(id, updatedOffer);
    return updatedOffer;
  }

  async getTransactions(userId?: string, limit = 50): Promise<EnergyTransaction[]> {
    let transactions = Array.from(this.energyTransactions.values());
    
    if (userId) {
      transactions = transactions.filter(
        (tx) => tx.buyerId === userId || tx.sellerId === userId,
      );
    }

    return transactions
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async createTransaction(insertTransaction: InsertEnergyTransaction): Promise<EnergyTransaction> {
    const id = randomUUID();
    const transaction: EnergyTransaction = { 
      ...insertTransaction, 
      id,
      status: "pending",
      createdAt: new Date()
    };
    this.energyTransactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(
    id: string, 
    status: string, 
    transactionHash?: string, 
    blockNumber?: number
  ): Promise<EnergyTransaction> {
    const transaction = this.energyTransactions.get(id);
    if (!transaction) throw new Error("Transaction not found");
    
    const updatedTransaction = { 
      ...transaction, 
      status, 
      transactionHash, 
      blockNumber 
    };
    this.energyTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getEnergyGeneration(userId: string): Promise<EnergyGeneration | undefined> {
    return Array.from(this.energyGeneration.values()).find(
      (gen) => gen.userId === userId,
    );
  }

  async updateEnergyGeneration(userId: string, insertGeneration: InsertEnergyGeneration): Promise<EnergyGeneration> {
    const existing = await this.getEnergyGeneration(userId);
    
    if (existing) {
      const updated = { 
        ...existing, 
        ...insertGeneration, 
        lastUpdated: new Date() 
      };
      this.energyGeneration.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const generation: EnergyGeneration = { 
        ...insertGeneration, 
        id,
        userId,
        lastUpdated: new Date()
      };
      this.energyGeneration.set(id, generation);
      return generation;
    }
  }
}

export const storage = new MemStorage();
