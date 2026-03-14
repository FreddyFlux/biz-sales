CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"outcome" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "activities_user_id_occurred_at_idx" ON "activities" USING btree ("user_id","occurred_at");