import type {
  Security,
  Price,
  News,
  ScoreRun,
  Score,
  InputCache,
  IndexScoreRun,
  ConstituentScore,
  Signature,
  CustomIndex,
} from "./schemas";
import {
  SecuritiesSchema,
  PricesSchema,
  NewsSchema,
  ScoreRunsSchema,
  ScoresSchema,
  InputCacheSchema,
  IndexScoreRunsSchema,
  ConstituentScoresSchema,
  SignaturesSchema,
  CustomIndexesSchema,
} from "./schemas";

const getMockSecurity = (overrides?: Partial<Security>): Security => {
  return SecuritiesSchema.parse({
    id: 1,
    ticker: "AAPL",
    name: "Apple Inc.",
    currency: "INR",
    sector: "Technology",
    industry: "Consumer Electronics",
    lotSize: 1,
    createdAt: new Date(),
    ...overrides,
  });
};

const getMockPrice = (overrides?: Partial<Price>): Price => {
  return PricesSchema.parse({
    id: 1,
    ticker: "AAPL",
    ts: new Date(),
    open: 150.0,
    high: 155.0,
    low: 149.0,
    close: 153.0,
    volume: 1000000,
    ...overrides,
  });
};

const getMockNews = (overrides?: Partial<News>): News => {
  return NewsSchema.parse({
    id: 1,
    ticker: "AAPL",
    ts: new Date(),
    source: "Reuters",
    title: "Apple Reports Strong Earnings",
    url: "https://example.com/news",
    summary: "Apple reports strong quarterly earnings",
    embeddingVector: null,
    ...overrides,
  });
};

const getMockScoreRun = (overrides?: Partial<ScoreRun>): ScoreRun => {
  return ScoreRunsSchema.parse({
    id: "550e8400-e29b-41d4-a716-446655440000",
    startedAt: new Date(),
    completedAt: null,
    total: 10,
    completed: 0,
    status: "pending",
    paramsJson: { tickers: ["AAPL", "GOOGL"] },
    ...overrides,
  });
};

const getMockScore = (overrides?: Partial<Score>): Score => {
  return ScoresSchema.parse({
    id: 1,
    runId: "550e8400-e29b-41d4-a716-446655440000",
    ticker: "AAPL",
    ts: new Date(),
    score: 0.75,
    confidence: 0.85,
    direction: "up",
    horizonDays: 7,
    rationaleJson: { reason: "Strong fundamentals" },
    risksJson: { market: "Volatility" },
    model: "gemini-2.0-flash-exp",
    inputHash: "abc123",
    ...overrides,
  });
};

const getMockInputCache = (overrides?: Partial<InputCache>): InputCache => {
  return InputCacheSchema.parse({
    id: 1,
    ticker: "AAPL",
    inputHash: "abc123",
    cachedAt: new Date(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    dataJson: { score: 0.75 },
    ...overrides,
  });
};

const getMockIndexScoreRun = (overrides?: Partial<IndexScoreRun>): IndexScoreRun => {
  return IndexScoreRunsSchema.parse({
    id: "550e8400-e29b-41d4-a716-446655440000",
    indexId: "NIFTY50",
    effectiveDate: new Date("2025-11-08"),
    status: "pending",
    createdAt: new Date(),
    completedAt: null,
    ...overrides,
  });
};

const getMockConstituentScore = (overrides?: Partial<ConstituentScore>): ConstituentScore => {
  return ConstituentScoresSchema.parse({
    id: "660e8400-e29b-41d4-a716-446655440000",
    indexRunId: "550e8400-e29b-41d4-a716-446655440000",
    indexId: "NIFTY50",
    ticker: "AAPL",
    sector: "Technology",
    effectiveDate: new Date("2025-11-08"),
    score: 0.75,
    confidence: 0.85,
    direction: "up",
    newsSentiment: {
      summary: "Strong earnings report",
      sentiment: "positive",
      postUrl: "https://example.com/post",
      blogUrl: "https://example.com/blog",
    },
    state: "pending",
    approvedBy: null,
    approvedAt: null,
    comments: null,
    createdAt: new Date(),
    ...overrides,
  });
};

const getMockSignature = (overrides?: Partial<Signature>): Signature => {
  return SignaturesSchema.parse({
    id: "770e8400-e29b-41d4-a716-446655440000",
    name: "GreenGrowthIndex",
    description: "Tech and Energy focused index",
    composition: [
      { sector: "Tech", percentage: 40 },
      { sector: "Energy", percentage: 30 },
      { sector: "Finance", percentage: 30 },
    ],
    createdBy: "user123",
    createdAt: new Date(),
    ...overrides,
  });
};

const getMockCustomIndex = (overrides?: Partial<CustomIndex>): CustomIndex => {
  return CustomIndexesSchema.parse({
    id: "880e8400-e29b-41d4-a716-446655440000",
    signatureId: "770e8400-e29b-41d4-a716-446655440000",
    name: "GreenGrowthIndex_2025-11-08",
    sectorsUsed: ["Tech", "Energy", "Finance"],
    constituentsSelected: ["AAPL", "GOOGL", "MSFT"],
    createdAt: new Date(),
    ...overrides,
  });
};

export {
  getMockSecurity,
  getMockPrice,
  getMockNews,
  getMockScoreRun,
  getMockScore,
  getMockInputCache,
  getMockIndexScoreRun,
  getMockConstituentScore,
  getMockSignature,
  getMockCustomIndex,
};

