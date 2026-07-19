CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"future_identity_id" uuid NOT NULL,
	"desired_outcome" text NOT NULL,
	"purpose" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "goals_desired_outcome_length_check" CHECK (char_length(trim("goals"."desired_outcome")) between 1 and 300),
	CONSTRAINT "goals_purpose_length_check" CHECK (char_length(trim("goals"."purpose")) between 1 and 2000),
	CONSTRAINT "goals_updated_at_check" CHECK ("goals"."updated_at" >= "goals"."created_at")
);
--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_future_identity_id_future_identities_id_fk" FOREIGN KEY ("future_identity_id") REFERENCES "public"."future_identities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "goals_future_identity_id_idx" ON "goals" USING btree ("future_identity_id");