import { createServer } from "http";
import { Server } from "socket.io";
import type { Message, Point } from "../types";
import { Gameflow } from "../base/gameflow.ts";

const httpServer = createServer();

const server = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const gameflow = new Gameflow(server);

server.on("connection", (socket) => {
  socket.on("joinGame", ({ nickname }) => {
    gameflow.startPlay(socket.id, nickname);
  });

  socket.on("chatMessage", (msgText: string, nickname: string) => {
    const msg: Message = {
      userId: socket.id,
      userName: nickname,
      text: msgText,
    };
    server.emit("newMsg", msg);
    gameflow.checkGuess(msg);
  });

  socket.on("drawing", (points: [Point, Point]) => {
    socket.broadcast.emit("drawing", points);
  });

  socket.on("clearCanvas", () => {
    socket.broadcast.emit("clearCanvas");
  });

  socket.on("leftGame", () => {
    console.log("left");
    gameflow.removePlayer(socket.id);
  });

  socket.on("disconnect", () => {
    gameflow.removePlayer(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log("Server is running");
});
