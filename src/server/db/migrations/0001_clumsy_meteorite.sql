CREATE TABLE "game_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"user_id" uuid,
	"guest_name" text,
	"player_index" integer NOT NULL,
	"is_ai" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_players_game_id_player_index_unique" UNIQUE("game_id","player_index")
);
--> statement-breakpoint
CREATE TABLE "game_words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"word" text NOT NULL,
	"move_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"game_player_id" uuid NOT NULL,
	"position_row" integer NOT NULL,
	"position_col" integer NOT NULL,
	"letter" text NOT NULL,
	"word" text NOT NULL,
	"score" integer NOT NULL,
	"move_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "current_player_index" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "base_word" text NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "status" text DEFAULT 'in_progress' NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "finished_at" timestamp;--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_words" ADD CONSTRAINT "game_words_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_words" ADD CONSTRAINT "game_words_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moves" ADD CONSTRAINT "moves_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moves" ADD CONSTRAINT "moves_game_player_id_game_players_id_fk" FOREIGN KEY ("game_player_id") REFERENCES "public"."game_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_players_game_id_idx" ON "game_players" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_players_user_id_idx" ON "game_players" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_words_game_id_idx" ON "game_words" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_words_word_idx" ON "game_words" USING btree ("word");--> statement-breakpoint
CREATE INDEX "game_words_move_id_idx" ON "game_words" USING btree ("move_id");--> statement-breakpoint
CREATE INDEX "moves_game_id_idx" ON "moves" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "moves_game_player_id_idx" ON "moves" USING btree ("game_player_id");--> statement-breakpoint
CREATE INDEX "moves_game_id_move_number_idx" ON "moves" USING btree ("game_id","move_number");--> statement-breakpoint
CREATE INDEX "moves_position_idx" ON "moves" USING btree ("position_row","position_col");--> statement-breakpoint
CREATE INDEX "games_status_idx" ON "games" USING btree ("status");--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "players";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "ai_players";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "moves";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "scores";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "used_words";