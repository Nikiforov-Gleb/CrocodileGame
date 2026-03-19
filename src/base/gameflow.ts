import { Server } from "socket.io";
import { getRandomWord } from "../utils.ts";
import type { GamePhase, Message } from "../types.ts";

export interface GameState {
  gamePhase: GamePhase;
  currentDrawerId: string | null;
  timeLeft: number;
}

export class Gameflow {
  private server: Server;

  private roundDuration: number = 60;
  private timer: NodeJS.Timeout | null = null;

  private players: string[] = [];
  private nicknames: Record<string, string> = {};
  private currentDrawerIndex = -1;
  private winnerIndex = -1;
  private gamePhase: GamePhase = "notActive";
  private timeLeft: number = 0;
  private language: string = "en";

  private currentWord: string | null = null;
  constructor(server: Server) {
    this.server = server;
  }

  startPlay(id: string, nickname: string, lang: string) {
    if (!this.players.includes(id)) {
      this.players.push(id);
      this.nicknames[id] = nickname;
      if (this.gamePhase === "notActive") {
        this.language = lang;
        this.startNewRound();
      }
    }
    this.emitCurrentState(id);
  }

  stopGame() {
    this.clearTimer();
    this.gamePhase = "notActive";
    this.currentWord = null;
    this.timeLeft = 0;
    this.currentDrawerIndex = -1;
    this.winnerIndex = -1;
  }

  removePlayer(id: string): boolean {
    if (this.players.includes(id)) {
      const removedIndex = this.players.indexOf(id);
      this.players = this.players.filter((playerId) => playerId !== id);
      delete this.nicknames[id];
      if (this.players.length === 0) {
        this.stopGame();
        return true;
      }
      if (removedIndex < this.currentDrawerIndex) {
        this.currentDrawerIndex--;
      } else if (removedIndex === this.currentDrawerIndex) {
        this.endRound("Ведущий вышел из игры:( Новый раунд");
      }
      if (removedIndex === this.winnerIndex) this.winnerIndex = -1;
      return true;
    } else return false;
  }

  checkGuess(msg: Message) {
    if (!this.currentWord) return;
    if (this.currentWord.toLowerCase() === msg.text.toLowerCase()) {
      this.endRound("Слово угадано", msg.userId);
    }
  }

  async startNewRound() {
    if (this.gamePhase === "loadingRound") return;
    this.gamePhase = "loadingRound";
    this.emitAllCurrentState();
    if (this.winnerIndex !== -1) {
      this.currentDrawerIndex = this.winnerIndex;
    } else {
      this.currentDrawerIndex =
        (this.currentDrawerIndex + 1) % this.players.length;
    }

    this.currentWord = await getRandomWord(this.language);
    if (this.players.length === 0) return;

    this.gamePhase = "playing";
    this.timeLeft = this.roundDuration;
    this.emitAllCurrentState();
    this.emitGameHost(true);
    this.startTimer();
  }

  private endRound(reason: string, winnerId?: string) {
    this.server.to(this.language).emit("endRound");

    this.clearTimer();
    this.emitGameHost(false);
    if (winnerId) {
      const nickname = this.nicknames[winnerId] || winnerId;
      const msg: Message = {
        userId: "admin",
        userName: "Крокодил",
        text: `${nickname} отгадал "${this.currentWord}"`,
      };
      this.server.to(this.language).emit("newMsg", msg);
      this.winnerIndex = this.players.indexOf(winnerId);
    } else {
      const msg: Message = {
        userId: "admin",
        userName: "Крокодил",
        text: reason,
      };
      this.server.to(this.language).emit("newMsg", msg);
      this.winnerIndex = -1;
    }
    this.startNewRound();
  }

  private startTimer() {
    this.timeLeft = this.roundDuration;
    this.server.to(this.language).emit("timeUpdate", this.timeLeft);
    this.timer = setInterval(() => {
      this.timeLeft--;

      if (this.timeLeft < 0) {
        this.endRound("Время вышло :(, новый раунд");
      } else {
        this.server.to(this.language).emit("timeUpdate", this.timeLeft);
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private getCurrentState(): GameState {
    return {
      currentDrawerId: this.getDrawerId(),
      gamePhase: this.gamePhase,
      timeLeft: this.timeLeft,
    };
  }

  private getDrawerId(): string | null {
    return this.currentDrawerIndex === -1
      ? null
      : this.players[this.currentDrawerIndex];
  }

  private emitGameHost(isGameHost: boolean) {
    const drawerId = this.getDrawerId();
    if (drawerId)
      this.server
        .to(this.language)
        .to(drawerId)
        .emit("gameHost", isGameHost ? this.currentWord : null);
  }

  private emitCurrentState(id: string) {
    this.server
      .to(this.language)
      .to(id)
      .emit("updatedGameState", this.getCurrentState());
  }

  private emitAllCurrentState() {
    this.server
      .to(this.language)
      .emit("updatedGameState", this.getCurrentState());
  }
}
