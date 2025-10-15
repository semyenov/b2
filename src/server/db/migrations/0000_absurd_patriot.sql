CREATE TABLE "games" (
	"id" uuid PRIMARY KEY NOT NULL,
	"size" integer NOT NULL,
	"board" jsonb NOT NULL,
	"players" jsonb NOT NULL,
	"ai_players" jsonb NOT NULL,
	"current_player_index" integer NOT NULL,
	"moves" jsonb NOT NULL,
	"scores" jsonb NOT NULL,
	"used_words" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word" text NOT NULL,
	"language" text DEFAULT 'ru' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "games_created_at_idx" ON "games" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "games_updated_at_idx" ON "games" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "words_word_idx" ON "words" USING btree ("word");--> statement-breakpoint
CREATE INDEX "words_language_idx" ON "words" USING btree ("language");--> statement-breakpoint
CREATE INDEX "words_word_language_idx" ON "words" USING btree ("word","language");