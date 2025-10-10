import { GameState } from "./engine/balda";

export class InMemoryStore {
  private games = new Map<string, GameState>();

  getAll(): GameState[] {
    return Array.from(this.games.values());
  }

  get(id: string): GameState | undefined {
    return this.games.get(id);
  }

  set(game: GameState): void {
    this.games.set(game.id, game);
  }

  has(id: string): boolean {
    return this.games.has(id);
  }
}

export const store = new InMemoryStore();
