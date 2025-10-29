import { Injectable } from "@nestjs/common";
import { db } from "../db/index";
import { scores, scoreRuns } from "../db/schemas";
import { eq, desc } from "drizzle-orm";
import { ScoringService } from "../services/scoring/scoring.service";

@Injectable()
export class ScoreService {
  async createBatch(options: { tickers: string[]; runId: string }) {
    const { tickers, runId } = options;

    if (!db) throw new Error("Database connection is not available");

    await db.insert(scoreRuns).values({
      id: runId,
      startedAt: new Date(),
      total: tickers.length,
      completed: 0,
      status: "pending",
      paramsJson: { tickers },
    });
  }

  async processBatch(options: { tickers: string[]; runId: string }) {
    const { tickers, runId } = options;

    if (!db) throw new Error("Database connection is not available");

    await db
      .update(scoreRuns)
      .set({ status: "running" })
      .where(eq(scoreRuns.id, runId));

    const scoringService = new ScoringService(process.env.GEMINI_API_KEY || "");

    for (const ticker of tickers) {
      try {
        await scoringService.scoreSecurity({
          ticker,
          runId,
          alphaApiKey: process.env.ALPHA_API_KEY || "",
          geminiApiKey: process.env.GEMINI_API_KEY || "",
        });
      } catch (error) {
        console.error(`Error scoring ${ticker}:`, error);
      }
    }

    const completed = await db
      .select()
      .from(scores)
      .where(eq(scores.runId, runId));

    await db
      .update(scoreRuns)
      .set({
        completed: completed.length,
        status: completed.length === tickers.length ? "complete" : "failed",
        completedAt: new Date(),
      })
      .where(eq(scoreRuns.id, runId));
  }

  async getBatchStatus(runId: string) {
    const run = await db
      .select()
      .from(scoreRuns)
      .where(eq(scoreRuns.id, runId))
      .limit(1);
    if (run.length === 0) return { error: "Run not found" };

    const batchScores = await db
      .select()
      .from(scores)
      .where(eq(scores.runId, runId));
    return { run: run[0], completed: batchScores.length, scores: batchScores };
  }

  async getTickerScore(ticker: string) {
    const latest = await db
      .select()
      .from(scores)
      .where(eq(scores.ticker, ticker))
      .orderBy(desc(scores.ts))
      .limit(1);

    if (latest.length === 0) return { error: "No score found for ticker" };
    return latest[0];
  }
}
