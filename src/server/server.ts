import type { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import type { Message, Point } from "../types";
import { GamesManager } from "../base/gamesManager.ts";

export function createSocketServer(httpServer: HTTPServer) {
  const server = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const gamesManager = new GamesManager(server);

  server.on("connection", (socket) => {
    socket.on(
      "joinGame",
      (nickname: string, lang: string, callback?: () => void) => {
        socket.join(lang);
        const gameflow = gamesManager.getGame(lang);
        gameflow.startPlay(socket.id, nickname, lang);
        callback?.();
      },
    );

    socket.on(
      "chatMessage",
      (msgText: string, nickname: string, lang: string) => {
        const gameflow = gamesManager.getGame(lang);
        const msg: Message = {
          userId: socket.id,
          userName: nickname,
          text: msgText,
        };
        server.to(lang).emit("newMsg", msg);
        gameflow.checkGuess(msg);
      },
    );

    socket.on("drawing", (points: [Point, Point], lang: string) => {
      socket.to(lang).emit("drawing", points);
    });

    socket.on("clearCanvas", (lang: string) => {
      socket.to(lang).emit("clearCanvas");
    });

    socket.on("leftGame", () => {
      gamesManager.removePlayer(socket.id);
    });

    socket.on("disconnect", () => {
      gamesManager.removePlayer(socket.id);
    });
  });

  return server;
}
