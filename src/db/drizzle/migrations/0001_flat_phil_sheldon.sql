CREATE TABLE IF NOT EXISTS "constituent_scores" (
	"id" uuid PRIMARY KEY NOT NULL,
	"index_run_id" uuid NOT NULL,
	"index_id" text NOT NULL,
	"ticker" text NOT NULL,
	"sector" text,
	"effective_date" date NOT NULL,
	"score" numeric(5, 4) NOT NULL,
	"confidence" numeric(5, 4) NOT NULL,
	"direction" text NOT NULL,
	"news_sentiment" jsonb,
	"state" text DEFAULT 'pending' NOT NULL,
	"approved_by" text,
	"approved_at" timestamp,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "custom_indexes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"signature_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sectors_used" jsonb NOT NULL,
	"constituents_selected" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "index_score_runs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"index_id" text NOT NULL,
	"effective_date" date NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "signatures" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"composition" jsonb NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scores" ALTER COLUMN "model" SET DEFAULT 'gemini-2.0-flash-exp';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "constituent_scores_effective_date_state_idx" ON "constituent_scores" ("effective_date","state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "constituent_scores_index_run_id_idx" ON "constituent_scores" ("index_run_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "constituent_scores_ticker_idx" ON "constituent_scores" ("ticker");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "constituent_scores_effective_date_idx" ON "constituent_scores" ("effective_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "index_score_runs_index_id_idx" ON "index_score_runs" ("index_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "index_score_runs_effective_date_idx" ON "index_score_runs" ("effective_date");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "constituent_scores" ADD CONSTRAINT "constituent_scores_index_run_id_index_score_runs_id_fk" FOREIGN KEY ("index_run_id") REFERENCES "index_score_runs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "constituent_scores" ADD CONSTRAINT "constituent_scores_ticker_securities_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "securities"("ticker") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_indexes" ADD CONSTRAINT "custom_indexes_signature_id_signatures_id_fk" FOREIGN KEY ("signature_id") REFERENCES "signatures"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
