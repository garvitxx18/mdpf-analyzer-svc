import { fetchMarketData, type MarketDataResult } from "../market-data/market-data.service";
import { fetchNews, type NewsResult } from "../news/news.service";

export type EnrichmentResult = {
  ticker: string;
  marketData: MarketDataResult;
  news: NewsResult;
};

export type EnrichmentOptions = {
  ticker: string;
  apiKey: string;
  newsLimit?: number;
};

export const enrichData = async (
  options: EnrichmentOptions
): Promise<EnrichmentResult> => {
  const { ticker, apiKey, newsLimit = 10 } = options;

  const [marketData, news] = await Promise.all([
    fetchMarketData({ ticker, apiKey }),
    fetchNews({ ticker, apiKey, limit: newsLimit }),
  ]);

  const result: EnrichmentResult = {
    ticker,
    marketData,
    news,
  };

  return result;
};

