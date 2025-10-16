CREATE INDEX "game_words_game_id_word_idx" ON "game_words" USING btree ("game_id","word");--> statement-breakpoint
CREATE INDEX "games_status_updated_at_idx" ON "games" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "moves_game_player_id_created_at_idx" ON "moves" USING btree ("game_player_id","created_at");