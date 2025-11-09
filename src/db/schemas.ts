import { z } from "zod";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  numeric,
  uuid,
  jsonb,
  index,
  unique,
  date,
} from "drizzle-orm/pg-core";

export const SecuritiesSchema = z.object({
  id: z.number().int().positive(),
  ticker: z.string().min(1),
  name: z.string().min(1),
  currency: z.string().default("INR"),
  sector: z.string().nullable(),
  industry: z.string().nullable(),
  lotSize: z.number().int().positive().default(1),
  createdAt: z.date(),
});

export const PricesSchema = z.object({
  id: z.number().int().positive(),
  ticker: z.string().min(1),
  ts: z.date(),
  open: z.number().nullable(),
  high: z.number().nullable(),
  low: z.number().nullable(),
  close: z.number().nullable(),
  volume: z.number().nullable(),
});

export const NewsSchema = z.object({
  id: z.number().int().positive(),
  ticker: z.string().min(1),
  ts: z.date(),
  source: z.string().nullable(),
  title: z.string(),
  url: z.string().nullable(),
  summary: z.string().nullable(),
  embeddingVector: z.array(z.number()).length(384).nullable(),
});

export const ScoreRunsSchema = z.object({
  id: z.string().uuid(),
  startedAt: z.date(),
  completedAt: z.date().nullable(),
  total: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative().default(0),
  status: z.enum(["pending", "running", "complete", "failed"]).default("pending"),
  paramsJson: z.record(z.unknown()),
});

export const ScoresSchema = z.object({
  id: z.number().int().positive(),
  runId: z.string().uuid(),
  ticker: z.string().min(1),
  ts: z.date(),
  score: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  direction: z.enum(["up", "flat", "down"]),
  horizonDays: z.number().int().positive(),
  rationaleJson: z.record(z.unknown()),
  risksJson: z.record(z.unknown()),
  model: z.string().default("gemini-2.0-flash-exp"),
  inputHash: z.string(),
});

export const InputCacheSchema = z.object({
  id: z.number().int().positive(),
  ticker: z.string().min(1),
  inputHash: z.string(),
  cachedAt: z.date(),
  expiresAt: z.date().nullable(),
  dataJson: z.record(z.unknown()),
});

export const IndexScoreRunsSchema = z.object({
  id: z.string().uuid(),
  indexId: z.string().min(1),
  effectiveDate: z.date(),
  status: z.enum(["pending", "running", "complete", "failed"]).default("pending"),
  createdAt: z.date(),
  completedAt: z.date().nullable(),
});

export const NewsSentimentSchema = z.object({
  summary: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  postUrl: z.string().url().nullable(),
  blogUrl: z.string().url().nullable(),
});

export const ConstituentScoresSchema = z.object({
  id: z.string().uuid(),
  indexRunId: z.string().uuid(),
  indexId: z.string().min(1),
  ticker: z.string().min(1),
  sector: z.string().nullable(),
  effectiveDate: z.date(),
  score: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  direction: z.enum(["up", "flat", "down"]),
  newsSentiment: NewsSentimentSchema.nullable(),
  state: z.enum(["pending", "approved", "rejected", "on_hold"]).default("pending"),
  approvedBy: z.string().nullable(),
  approvedAt: z.date().nullable(),
  comments: z.string().nullable(),
  createdAt: z.date(),
});

export const SignatureCompositionSchema = z.object({
  sector: z.string().min(1),
  percentage: z.number().min(0).max(100),
});

export const SignaturesSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  composition: z.array(SignatureCompositionSchema),
  createdBy: z.string().min(1),
  createdAt: z.date(),
});

export const CustomIndexesSchema = z.object({
  id: z.string().uuid(),
  signatureId: z.string().uuid(),
  name: z.string().min(1),
  sectorsUsed: z.array(z.string()),
  constituentsSelected: z.array(z.string()),
  createdAt: z.date(),
});

export type Security = z.infer<typeof SecuritiesSchema>;
export type Price = z.infer<typeof PricesSchema>;
export type News = z.infer<typeof NewsSchema>;
export type ScoreRun = z.infer<typeof ScoreRunsSchema>;
export type Score = z.infer<typeof ScoresSchema>;
export type InputCache = z.infer<typeof InputCacheSchema>;
export type IndexScoreRun = z.infer<typeof IndexScoreRunsSchema>;
export type NewsSentiment = z.infer<typeof NewsSentimentSchema>;
export type ConstituentScore = z.infer<typeof ConstituentScoresSchema>;
export type SignatureComposition = z.infer<typeof SignatureCompositionSchema>;
export type Signature = z.infer<typeof SignaturesSchema>;
export type CustomIndex = z.infer<typeof CustomIndexesSchema>;

export const securities = pgTable(
  "securities",
  {
    id: serial("id").primaryKey(),
    ticker: text("ticker").notNull().unique(),
    name: text("name").notNull(),
    currency: text("currency").notNull().default("INR"),
    sector: text("sector"),
    industry: text("industry"),
    lotSize: integer("lot_size").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tickerIdx: index("securities_ticker_idx").on(table.ticker),
  })
);

export const prices = pgTable(
  "prices",
  {
    id: serial("id").primaryKey(),
    ticker: text("ticker")
      .notNull()
      .references(() => securities.ticker, { onDelete: "cascade" }),
    ts: timestamp("ts").notNull(),
    open: numeric("open", { precision: 18, scale: 6 }),
    high: numeric("high", { precision: 18, scale: 6 }),
    low: numeric("low", { precision: 18, scale: 6 }),
    close: numeric("close", { precision: 18, scale: 6 }),
    volume: numeric("volume"),
  },
  (table) => ({
    tickerTsIdx: unique().on(table.ticker, table.ts),
    tickerIdx: index("prices_ticker_idx").on(table.ticker),
    tsIdx: index("prices_ts_idx").on(table.ts),
  })
);

export const news = pgTable(
  "news",
  {
    id: serial("id").primaryKey(),
    ticker: text("ticker")
      .notNull()
      .references(() => securities.ticker, { onDelete: "cascade" }),
    ts: timestamp("ts").notNull(),
    source: text("source"),
    title: text("title").notNull(),
    url: text("url"),
    summary: text("summary"),
    embeddingVector: jsonb("embedding_vector"),
  },
  (table) => ({
    tickerTsTitleIdx: unique().on(table.ticker, table.ts, table.title),
    tickerIdx: index("news_ticker_idx").on(table.ticker),
    tsIdx: index("news_ts_idx").on(table.ts),
  })
);

export const scoreRuns = pgTable("score_runs", {
  id: uuid("id").primaryKey(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  total: integer("total").notNull(),
  completed: integer("completed").notNull().default(0),
  status: text("status")
    .notNull()
    .default("pending")
    .$type<"pending" | "running" | "complete" | "failed">(),
  paramsJson: jsonb("params_json").notNull(),
});

export const scores = pgTable(
  "scores",
  {
    id: serial("id").primaryKey(),
    runId: uuid("run_id")
      .notNull()
      .references(() => scoreRuns.id, { onDelete: "cascade" }),
    ticker: text("ticker")
      .notNull()
      .references(() => securities.ticker),
    ts: timestamp("ts").defaultNow().notNull(),
    score: numeric("score", { precision: 5, scale: 4 }).notNull(),
    confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
    direction: text("direction")
      .notNull()
      .$type<"up" | "flat" | "down">(),
    horizonDays: integer("horizon_days").notNull(),
    rationaleJson: jsonb("rationale_json").notNull(),
    risksJson: jsonb("risks_json").notNull(),
    model: text("model").notNull().default("gemini-2.0-flash-exp"),
    inputHash: text("input_hash").notNull(),
  },
  (table) => ({
    tickerRunIdIdx: unique().on(table.ticker, table.runId),
    tickerIdx: index("scores_ticker_idx").on(table.ticker),
    runIdIdx: index("scores_run_id_idx").on(table.runId),
  })
);

export const inputCache = pgTable("input_cache", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  inputHash: text("input_hash").notNull().unique(),
  cachedAt: timestamp("cached_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  dataJson: jsonb("data_json").notNull(),
});

export const indexScoreRuns = pgTable(
  "index_score_runs",
  {
    id: uuid("id").primaryKey(),
    indexId: text("index_id").notNull(),
    effectiveDate: date("effective_date").notNull(),
    status: text("status")
      .notNull()
      .default("pending")
      .$type<"pending" | "running" | "complete" | "failed">(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    indexIdIdx: index("index_score_runs_index_id_idx").on(table.indexId),
    effectiveDateIdx: index("index_score_runs_effective_date_idx").on(table.effectiveDate),
  })
);

export const constituentScores = pgTable(
  "constituent_scores",
  {
    id: uuid("id").primaryKey(),
    indexRunId: uuid("index_run_id")
      .notNull()
      .references(() => indexScoreRuns.id, { onDelete: "cascade" }),
    indexId: text("index_id").notNull(),
    ticker: text("ticker")
      .notNull()
      .references(() => securities.ticker),
    sector: text("sector"),
    effectiveDate: date("effective_date").notNull(),
    score: numeric("score", { precision: 5, scale: 4 }).notNull(),
    confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
    direction: text("direction")
      .notNull()
      .$type<"up" | "flat" | "down">(),
    newsSentiment: jsonb("news_sentiment"),
    state: text("state")
      .notNull()
      .default("pending")
      .$type<"pending" | "approved" | "rejected" | "on_hold">(),
    approvedBy: text("approved_by"),
    approvedAt: timestamp("approved_at"),
    comments: text("comments"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    effectiveDateStateIdx: index("constituent_scores_effective_date_state_idx").on(
      table.effectiveDate,
      table.state
    ),
    indexRunIdIdx: index("constituent_scores_index_run_id_idx").on(table.indexRunId),
    tickerIdx: index("constituent_scores_ticker_idx").on(table.ticker),
    effectiveDateIdx: index("constituent_scores_effective_date_idx").on(table.effectiveDate),
  })
);

export const signatures = pgTable("signatures", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  composition: jsonb("composition").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customIndexes = pgTable("custom_indexes", {
  id: uuid("id").primaryKey(),
  signatureId: uuid("signature_id")
    .notNull()
    .references(() => signatures.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sectorsUsed: jsonb("sectors_used").notNull(),
  constituentsSelected: jsonb("constituents_selected").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

