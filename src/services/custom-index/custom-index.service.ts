import { db } from "../../db/index";
import {
  constituentScores,
  signatures,
  customIndexes,
  type CustomIndex,
  type Signature,
} from "../../db/schemas";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export type CreateCustomIndexOptions = {
  signatureId: string;
  name: string;
};

export type CreateCustomIndexResult = CustomIndex;

const getLatestEffectiveDate = async (): Promise<Date | null> => {
  if (!db) {
    throw new Error("Database connection is not available");
  }

  const latestRun = await db
    .select({ effectiveDate: constituentScores.effectiveDate })
    .from(constituentScores)
    .orderBy(desc(constituentScores.effectiveDate))
    .limit(1);

  if (latestRun.length === 0) {
    return null;
  }

  const effectiveDate = latestRun[0]?.effectiveDate;
  if (!effectiveDate) {
    return null;
  }

  return new Date(effectiveDate);
};

const selectTopConstituentsBySector = (
  scores: Array<{
    ticker: string;
    sector: string | null;
    score: string;
  }>,
  sector: string,
  count: number
): string[] => {
  return scores
    .filter((s) => s.sector === sector)
    .sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
    .slice(0, count)
    .map((s) => s.ticker);
};

export class CustomIndexService {
  async createCustomIndex(
    options: CreateCustomIndexOptions
  ): Promise<CreateCustomIndexResult> {
    const { signatureId, name } = options;

    if (!db) {
      throw new Error("Database connection is not available");
    }

    const signatureRecord = await db
      .select()
      .from(signatures)
      .where(eq(signatures.id, signatureId))
      .limit(1);

    if (signatureRecord.length === 0) {
      throw new Error(`Signature not found: ${signatureId}`);
    }

    const signature = signatureRecord[0] as Signature;
    const latestEffectiveDate = await getLatestEffectiveDate();

    if (!latestEffectiveDate) {
      throw new Error("No effective date found. Please score an index first.");
    }

    const effectiveDateStr = latestEffectiveDate.toISOString().split("T")[0];
    if (!effectiveDateStr) {
      throw new Error("Invalid effective date");
    }

    const approvedScores = await db
      .select({
        ticker: constituentScores.ticker,
        sector: constituentScores.sector,
        score: constituentScores.score,
      })
      .from(constituentScores)
      .where(
        and(
          eq(constituentScores.effectiveDate, effectiveDateStr),
          eq(constituentScores.state, "approved")
        )
      );

    const selectedConstituents: string[] = [];
    const sectorsUsed: string[] = [];

    for (const compositionItem of signature.composition as Array<{
      sector: string;
      percentage: number;
    }>) {
      const sectorConstituents = selectTopConstituentsBySector(
        approvedScores,
        compositionItem.sector,
        Math.ceil((compositionItem.percentage / 100) * 10)
      );

      selectedConstituents.push(...sectorConstituents);
      if (sectorConstituents.length > 0) {
        sectorsUsed.push(compositionItem.sector);
      }
    }

    const customIndexId = uuidv4();

    await db.insert(customIndexes).values({
      id: customIndexId,
      signatureId,
      name,
      sectorsUsed,
      constituentsSelected: selectedConstituents,
      createdAt: new Date(),
    });

    const createdIndex = await db
      .select()
      .from(customIndexes)
      .where(eq(customIndexes.id, customIndexId))
      .limit(1);

    if (createdIndex.length === 0) {
      throw new Error("Failed to create custom index");
    }

    return createdIndex[0] as CustomIndex;
  }
}

