import type { Server } from "socket.io";
import { Gameflow } from "./gameflow.ts";

export class GamesManager {
  private server: Server;
  private games: Record<string, Gameflow> = {};

  constructor(server: Server) {
    this.server = server;
  }

  getGame(lang: string): Gameflow {
    if (!this.games[lang]) {
      this.games[lang] = new Gameflow(this.server);
    }
    return this.games[lang];
  }

  removePlayer(socketId: string) {
    for (const gameflow of Object.values(this.games)) {
      if (gameflow.removePlayer(socketId)) {
        break;
      }
    }
  }

  removeGame(lang: string) {
    delete this.games[lang];
  }
}
