import { Server } from "socket.io";
import { getRandomWord } from "../utils.ts";
import type { Message } from "../types.ts";

export interface GameState {
  isPlaying: boolean;
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
  private isPlaying: boolean = false;
  private timeLeft: number = 0;

  private currentWord: string | null = null;
  constructor(server: Server) {
    this.server = server;
  }

  startPlay(id: string, nickname: string) {
    console.log(this.players.length);
    if (!this.players.includes(id)) {
      this.players.push(id);
      this.nicknames[id] = nickname;
      if (!this.isPlaying) {
        this.startNewRound();
        this.currentDrawerIndex =
          (this.currentDrawerIndex + 1) % this.players.length;
      }
    }
    this.emitCurrentState(id);
  }

  removePlayer(id: string) {
    if (this.players.includes(id)) {
      this.players = this.players.filter((playerId) => playerId !== id);
      if (this.players.length === 0) {
        //заканчиваем
      }
      if (this.getDrawerId() === id) {
        //начинаем заново
      }
    }
  }

  checkGuess(msg: Message) {
    if (!this.currentWord) return;
    if (this.currentWord.toLowerCase() === msg.text.toLowerCase()) {
      this.endRound(msg.userId);
    }
  }

  async startNewRound() {
    if (this.players.length === 0) return;
    this.currentWord = await getRandomWord();

    this.emitAllCurrentState();
    this.emitGameHost(true);
    this.startTimer();
    this.isPlaying = true;
  }

  private endRound(victoriousId?: string) {
    this.server.emit("endRound");

    this.clearTimer();
    this.emitGameHost(false);
    if (victoriousId) {
      const nickname = this.nicknames[victoriousId] || victoriousId;
      const msg: Message = {
        userId: "",
        userName: "Крокодил",
        text: `${nickname} отгадал "${this.currentWord}"`,
      };
      this.server.emit("newMsg", msg);

      const victoriousIndex = this.players.indexOf(victoriousId);
      if (victoriousIndex !== -1) {
        this.currentDrawerIndex = this.players.indexOf(victoriousId);
      } else {
        this.currentDrawerIndex =
          (this.currentDrawerIndex + 1) % this.players.length;
      }
    } else {
      const msg: Message = {
        userId: "",
        userName: "Крокодил",
        text: "Время вышло :(, новый раунд",
      };
      this.server.emit("newMsg", msg);
      this.currentDrawerIndex =
        (this.currentDrawerIndex + 1) % this.players.length;
    }
    this.startNewRound();
  }

  private startTimer() {
    this.timeLeft = this.roundDuration;
    this.timer = setInterval(() => {
      this.timeLeft--;

      if (this.timeLeft <= -1) {
        this.endRound();
      } else {
        this.server.emit("timeUpdate", this.timeLeft);
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
    console.log(this.currentDrawerIndex);
    return {
      currentDrawerId:
        this.currentDrawerIndex === -1
          ? null
          : this.players[this.currentDrawerIndex],
      isPlaying: this.isPlaying,
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
        .to(drawerId)
        .emit("gameHost", isGameHost ? this.currentWord : null);
  }

  private emitCurrentState(id: string) {
    this.server.to(id).emit("updatedGameState", this.getCurrentState());
  }

  private emitAllCurrentState() {
    this.server.emit("updatedGameState", this.getCurrentState());
  }
}
