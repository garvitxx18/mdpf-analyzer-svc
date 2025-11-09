import { db } from "../../db/index";
import {
  indexScoreRuns,
  constituentScores,
  securities,
  type NewsSentiment,
} from "../../db/schemas";
import { eq } from "drizzle-orm";
import { IndexService } from "./index.service";
import { GeminiClient } from "../gemini/gemini-client";
import { enrichData } from "../data-enrichment/data-enrichment.service";
import { buildGeminiPrompt } from "../gemini/gemini-prompt";
import { v4 as uuidv4 } from "uuid";

export type ScoreIndexOptions = {
  indexId: string;
  effectiveDate: Date;
  runId?: string;
};

export type ScoreIndexResult = {
  indexRunId: string;
  indexId: string;
  effectiveDate: Date;
};

export type IndexOrchestratorServiceOptions = {
  alphaApiKey: string;
  geminiApiKey: string;
};

const extractNewsSentiment = (
  enrichedData: Awaited<ReturnType<typeof enrichData>>,
  rationaleSentiment: string
): NewsSentiment | null => {
  if (enrichedData.news.articles.length === 0) {
    return null;
  }

  const topArticle = enrichedData.news.articles[0];
  if (!topArticle) {
    return null;
  }

  const secondArticle = enrichedData.news.articles[1] || null;

  const sentiment = rationaleSentiment.toLowerCase().includes("positive")
    ? "positive"
    : rationaleSentiment.toLowerCase().includes("negative")
    ? "negative"
    : "neutral";

  return {
    summary: topArticle.summary || topArticle.title,
    sentiment: sentiment as "positive" | "neutral" | "negative",
    postUrl: topArticle.url || null,
    blogUrl: secondArticle?.url || null,
  };
};

export class IndexOrchestratorService {
  private indexService: IndexService;
  private geminiClient: GeminiClient;
  private alphaApiKey: string;

  constructor(options: IndexOrchestratorServiceOptions) {
    const { alphaApiKey, geminiApiKey } = options;
    this.alphaApiKey = alphaApiKey;
    this.indexService = new IndexService();
    this.geminiClient = new GeminiClient({ apiKey: geminiApiKey });
  }

  async scoreIndex(options: ScoreIndexOptions): Promise<ScoreIndexResult> {
    const { indexId, effectiveDate, runId } = options;
    const indexRunId = runId || uuidv4();

    if (!db) {
      throw new Error("Database connection is not available");
    }

    const indexData = await this.indexService.getIndexConstituents({
      indexId,
    });

    const effectiveDateStr = effectiveDate.toISOString().split("T")[0];
    
    await db.insert(indexScoreRuns).values({
      id: indexRunId,
      indexId: indexId,
      effectiveDate: effectiveDateStr,
      status: "pending" as const,
      createdAt: new Date(),
      completedAt: null,
    } as never);

    await db
      .update(indexScoreRuns)
      .set({ status: "running" })
      .where(eq(indexScoreRuns.id, indexRunId));

    for (const constituent of indexData.constituents) {
      try {
        await this.ensureSecurityExists(constituent.ticker);

        const enrichedData = await enrichData({
          ticker: constituent.ticker,
          apiKey: this.alphaApiKey,
        });

        const prompt = buildGeminiPrompt(enrichedData);
        const geminiResponse = await this.geminiClient.scoreSecurity(prompt);

        const newsSentiment = extractNewsSentiment(
          enrichedData,
          geminiResponse.rationale.sentiment || "neutral"
        );

        const constituentScoreId = uuidv4();
        const effectiveDateStr = effectiveDate.toISOString().split("T")[0];

        await db.insert(constituentScores).values({
          id: constituentScoreId,
          indexRunId: indexRunId,
          indexId: indexId,
          ticker: constituent.ticker,
          sector: constituent.sector || null,
          effectiveDate: effectiveDateStr,
          score: geminiResponse.score.toString(),
          confidence: geminiResponse.confidence.toString(),
          direction: geminiResponse.direction,
          newsSentiment: newsSentiment || null,
          state: "pending" as const,
          approvedBy: null,
          approvedAt: null,
          comments: null,
          createdAt: new Date(),
        } as never);
      } catch (error) {
        console.error(
          `Error scoring constituent ${constituent.ticker}:`,
          error
        );
      }
    }

    await db
      .update(indexScoreRuns)
      .set({
        status: "complete",
        completedAt: new Date(),
      })
      .where(eq(indexScoreRuns.id, indexRunId));

    return {
      indexRunId,
      indexId,
      effectiveDate,
    };
  }

  private async ensureSecurityExists(ticker: string): Promise<void> {
    if (!db) {
      throw new Error("Database connection is not available");
    }

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

