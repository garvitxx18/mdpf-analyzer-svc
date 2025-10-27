import { db } from "../../db/index";
import { enrichData } from "../data-enrichment/data-enrichment.service";
import { buildGeminiPrompt } from "../gemini/gemini-prompt";
import { GeminiClient } from "../gemini/gemini-client";
import { calculateInputHash, shouldSkipScoring } from "./deduplication";
import { scores, securities } from "../../db/schemas";
import { eq } from "drizzle-orm";

export type ScoringOptions = {
  ticker: string;
  runId: string;
  alphaApiKey: string;
  geminiApiKey: string;
};

export type ScoringResult = {
  ticker: string;
  score: number;
  confidence: number;
  direction: "up" | "flat" | "down";
  inputHash: string;
};

export class ScoringService {
  private geminiClient: GeminiClient;

  constructor(geminiApiKey: string) {
    this.geminiClient = new GeminiClient({ apiKey: geminiApiKey });
  }

  async scoreSecurity(options: ScoringOptions): Promise<ScoringResult> {
    const { ticker, runId, alphaApiKey } = options;

    await this.ensureSecurityExists(ticker);

    const enrichedData = await enrichData({
      ticker,
      apiKey: alphaApiKey,
    });

    const inputHash = calculateInputHash(enrichedData);

    const shouldSkip = await shouldSkipScoring(ticker, inputHash, db as never);
    if (shouldSkip) {
      console.log(`Reusing existing score for ${ticker}`);
      
      const existingScore = await db
        .select()
        .from(scores)
        .where(eq(scores.ticker, ticker))
        .orderBy(scores.ts)
        .limit(1);
      
      if (existingScore.length > 0 && existingScore[0]) {

        await db.insert(scores).values({
          runId,
          ticker,
          score: existingScore[0].score,
          confidence: existingScore[0].confidence,
          direction: existingScore[0].direction,
          horizonDays: existingScore[0].horizonDays,
          rationaleJson: existingScore[0].rationaleJson,
          risksJson: existingScore[0].risksJson,
          model: existingScore[0].model,
          inputHash,
        });

        return {
          ticker,
          score: parseFloat(existingScore[0].score),
          confidence: parseFloat(existingScore[0].confidence),
          direction: existingScore[0].direction,
          inputHash,
        };
      }
    }

    const prompt = buildGeminiPrompt(enrichedData);
    console.log("Prompt for ticker:", ticker, "is:", prompt);
    const score = await this.geminiClient.scoreSecurity(prompt);

    await db.insert(scores).values({
      runId,
      ticker,
      score: score.score.toString(),
      confidence: score.confidence.toString(),
      direction: score.direction,
      horizonDays: score.horizon_days,
      rationaleJson: score.rationale,
      risksJson: score.risks,
      model: "gemini-2.0-flash-exp",
      inputHash,
    });

    return {
      ticker,
      score: score.score,
      confidence: score.confidence,
      direction: score.direction,
      inputHash,
    };
  }

  private async ensureSecurityExists(ticker: string): Promise<void> {
    const existing = await db
      .select()
      .from(securities)
      .where(eq(securities.ticker, ticker))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(securities).values({
        ticker,
        name: ticker,
        currency: "USD",
        sector: null,
        industry: null,
        lotSize: 1,
      }).onConflictDoNothing();
    }
  }
}

