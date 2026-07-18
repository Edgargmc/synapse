CREATE TABLE "future_identities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"statement" text NOT NULL,
	"purpose" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "future_identities_statement_length_check" CHECK (char_length(trim("future_identities"."statement")) between 1 and 160),
	CONSTRAINT "future_identities_purpose_length_check" CHECK (char_length(trim("future_identities"."purpose")) between 1 and 2000),
	CONSTRAINT "future_identities_updated_at_check" CHECK ("future_identities"."updated_at" >= "future_identities"."created_at")
);
