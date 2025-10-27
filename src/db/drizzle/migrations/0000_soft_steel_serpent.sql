CREATE TABLE IF NOT EXISTS "input_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" text NOT NULL,
	"input_hash" text NOT NULL,
	"cached_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"data_json" jsonb NOT NULL,
	CONSTRAINT "input_cache_input_hash_unique" UNIQUE("input_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" text NOT NULL,
	"ts" timestamp NOT NULL,
	"source" text,
	"title" text NOT NULL,
	"url" text,
	"summary" text,
	"embedding_vector" jsonb,
	CONSTRAINT "news_ticker_ts_title_unique" UNIQUE("ticker","ts","title")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" text NOT NULL,
	"ts" timestamp NOT NULL,
	"open" numeric(18, 6),
	"high" numeric(18, 6),
	"low" numeric(18, 6),
	"close" numeric(18, 6),
	"volume" numeric,
	CONSTRAINT "prices_ticker_ts_unique" UNIQUE("ticker","ts")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "score_runs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"total" integer NOT NULL,
	"completed" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"params_json" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" uuid NOT NULL,
	"ticker" text NOT NULL,
	"ts" timestamp DEFAULT now() NOT NULL,
	"score" numeric(5, 4) NOT NULL,
	"confidence" numeric(5, 4) NOT NULL,
	"direction" text NOT NULL,
	"horizon_days" integer NOT NULL,
	"rationale_json" jsonb NOT NULL,
	"risks_json" jsonb NOT NULL,
	"model" text DEFAULT 'gemini-2.0-flash-exp' NOT NULL,
	"input_hash" text NOT NULL,
	CONSTRAINT "scores_ticker_run_id_unique" UNIQUE("ticker","run_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "securities" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" text NOT NULL,
	"name" text NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"sector" text,
	"industry" text,
	"lot_size" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "securities_ticker_unique" UNIQUE("ticker")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "news_ticker_idx" ON "news" ("ticker");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "news_ts_idx" ON "news" ("ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prices_ticker_idx" ON "prices" ("ticker");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prices_ts_idx" ON "prices" ("ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scores_ticker_idx" ON "scores" ("ticker");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scores_run_id_idx" ON "scores" ("run_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "securities_ticker_idx" ON "securities" ("ticker");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "news" ADD CONSTRAINT "news_ticker_securities_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "securities"("ticker") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prices" ADD CONSTRAINT "prices_ticker_securities_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "securities"("ticker") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scores" ADD CONSTRAINT "scores_run_id_score_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "score_runs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scores" ADD CONSTRAINT "scores_ticker_securities_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "securities"("ticker") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
