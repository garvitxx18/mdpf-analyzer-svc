import { db } from "../../db/index";
import { securities } from "../../db/schemas";
import { eq } from "drizzle-orm";
import type { Security } from "../../db/schemas";
import { getMockSecurity } from "../../db/test-factories";

export type InsertSecurityInput = {
  ticker: string;
  name: string;
  currency?: string;
  sector?: string;
  industry?: string;
  lotSize?: number;
};

export const insertSecurity = async (input: InsertSecurityInput): Promise<Security> => {
  const [inserted] = await db
    .insert(securities)
    .values({
      ticker: input.ticker,
      name: input.name,
      currency: input.currency || "INR",
      sector: input.sector || null,
      industry: input.industry || null,
      lotSize: input.lotSize || 1,
    })
    .returning();

  if (!inserted) {
    throw new Error("Failed to insert security");
  }

  return getMockSecurity({
    id: inserted.id,
    ticker: inserted.ticker,
    name: inserted.name,
    currency: inserted.currency || "INR",
    sector: inserted.sector || null,
    industry: inserted.industry || null,
    lotSize: inserted.lotSize || 1,
    createdAt: inserted.createdAt,
  });
};

export const findByTicker = async (ticker: string): Promise<Security | undefined> => {
  const result = await db
    .select()
    .from(securities)
    .where(eq(securities.ticker, ticker))
    .limit(1);

  if (result.length === 0) {
    return undefined;
  }

  const security = result[0];
  if (!security) {
    return undefined;
  }
  
  return getMockSecurity({
    id: security.id,
    ticker: security.ticker,
    name: security.name,
    currency: security.currency || "INR",
    sector: security.sector || null,
    industry: security.industry || null,
    lotSize: security.lotSize || 1,
    createdAt: security.createdAt,
  });
};

