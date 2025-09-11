import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").unique(),
  userType: text("user_type").notNull().default("consumer"), // 'prosumer' or 'consumer'
  createdAt: timestamp("created_at").defaultNow(),
});

export const energyOffers = pgTable("energy_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  energyAmount: decimal("energy_amount", { precision: 10, scale: 2 }).notNull(),
  pricePerKwh: decimal("price_per_kwh", { precision: 10, scale: 6 }).notNull(),
  energyType: text("energy_type").notNull(), // 'solar', 'wind', 'hydro', 'other'
  location: text("location"),
  isActive: boolean("is_active").default(true),
  contractAddress: text("contract_address"),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const energyTransactions = pgTable("energy_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").references(() => energyOffers.id).notNull(),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  energyAmount: decimal("energy_amount", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 6 }).notNull(),
  transactionHash: text("transaction_hash"),
  blockNumber: integer("block_number"),
  status: text("status").default("pending"), // 'pending', 'confirmed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const energyGeneration = pgTable("energy_generation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  currentOutput: decimal("current_output", { precision: 8, scale: 2 }).notNull(),
  dailyGeneration: decimal("daily_generation", { precision: 10, scale: 2 }).notNull(),
  availableToSell: decimal("available_to_sell", { precision: 10, scale: 2 }).notNull(),
  energyType: text("energy_type").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEnergyOfferSchema = createInsertSchema(energyOffers).omit({
  id: true,
  createdAt: true,
  contractAddress: true,
  transactionHash: true,
});

export const insertEnergyTransactionSchema = createInsertSchema(energyTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertEnergyGenerationSchema = createInsertSchema(energyGeneration).omit({
  id: true,
  lastUpdated: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type EnergyOffer = typeof energyOffers.$inferSelect;
export type InsertEnergyOffer = z.infer<typeof insertEnergyOfferSchema>;
export type EnergyTransaction = typeof energyTransactions.$inferSelect;
export type InsertEnergyTransaction = z.infer<typeof insertEnergyTransactionSchema>;
export type EnergyGeneration = typeof energyGeneration.$inferSelect;
export type InsertEnergyGeneration = z.infer<typeof insertEnergyGenerationSchema>;
