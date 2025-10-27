import crypto from "crypto";
import { eq, and, desc } from "drizzle-orm";
import type { EnrichmentResult } from "../data-enrichment/data-enrichment.service";
import { scores } from "../../db/schemas";

export const calculateInputHash = (data: EnrichmentResult): string => {
  const normalizedData = JSON.stringify({
    ticker: data.ticker,
    marketData: data.marketData.prices,
    news: data.news.articles.map((article) => ({
      title: article.title,
      summary: article.summary,
      source: article.source,
    })),
  });

  return crypto.createHash("sha256").update(normalizedData).digest("hex");
};

const SIX_HOURS = 6 * 60 * 60 * 1000;

export const shouldSkipScoring = async (
  ticker: string,
  inputHash: string,
  dbInstance: any
): Promise<boolean> => {
  const recentScore = await dbInstance
    .select()
    .from(scores)
    .where(
      and(
        eq(scores.ticker, ticker),
        eq(scores.inputHash, inputHash)
      )
    )
    .orderBy(desc(scores.ts))
    .limit(1);

  if (recentScore.length === 0) {
    return false;
  }

  const mostRecent = recentScore[0];
  const age = Date.now() - mostRecent.ts.getTime();

  return age <= SIX_HOURS;
};

