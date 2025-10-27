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

export type Security = z.infer<typeof SecuritiesSchema>;
export type Price = z.infer<typeof PricesSchema>;
export type News = z.infer<typeof NewsSchema>;
export type ScoreRun = z.infer<typeof ScoreRunsSchema>;
export type Score = z.infer<typeof ScoresSchema>;
export type InputCache = z.infer<typeof InputCacheSchema>;

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

