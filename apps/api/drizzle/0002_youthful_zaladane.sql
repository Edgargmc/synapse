CREATE TABLE "attention_nodes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "attention_nodes_name_length_check" CHECK (char_length(trim("attention_nodes"."name")) between 1 and 100),
	CONSTRAINT "attention_nodes_description_length_check" CHECK ("attention_nodes"."description" is null or char_length(trim("attention_nodes"."description")) between 1 and 1000),
	CONSTRAINT "attention_nodes_updated_at_check" CHECK ("attention_nodes"."updated_at" >= "attention_nodes"."created_at")
);
--> statement-breakpoint
CREATE TABLE "goal_attention_nodes" (
	"goal_id" uuid NOT NULL,
	"attention_node_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "goal_attention_nodes_pk" PRIMARY KEY("goal_id","attention_node_id")
);
--> statement-breakpoint
ALTER TABLE "goal_attention_nodes" ADD CONSTRAINT "goal_attention_nodes_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_attention_nodes" ADD CONSTRAINT "goal_attention_nodes_attention_node_id_attention_nodes_id_fk" FOREIGN KEY ("attention_node_id") REFERENCES "public"."attention_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "goal_attention_nodes_attention_node_id_idx" ON "goal_attention_nodes" USING btree ("attention_node_id");