import { createServer } from "http";
import { Server } from "socket.io";
import type { Message, Point } from "../types";

const httpServer = createServer();

const server = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

server.on("connection", (socket) => {
  socket.emit("connectionSet", socket.id);

  socket.on("chatMessage", (msgText: string, nickname: string) => {
    const msg: Message = {
      userId: socket.id,
      userName: nickname,
      text: msgText,
    };
    server.emit("newMsg", msg);
  });

  socket.on("drawing", (points: [Point, Point]) => {
    socket.broadcast.emit("drawing", points);
  });

  socket.on("clearCanvas", () => {
    socket.broadcast.emit("clearCanvas");
  });
});

httpServer.listen(3001, () => {
  console.log("Server is running");
});

// `${socket.id} количесвто ${server.engine.clientsCount}`
