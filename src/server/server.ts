import { createServer } from "http";
import { Server } from "socket.io";
import type { Message } from "../types";

const httpServer = createServer();

const server = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

server.on("connection", (socket) => {
  socket.emit("connectionSet", socket.id);

  socket.on("chatMessage", (msgText: string) => {
    const msg: Message = {
      userId: socket.id,
      text: msgText,
    };
    server.emit("newMsg", msg);
  });
});

httpServer.listen(3001, () => {
  console.log("Server is running");
});

// `${socket.id} количесвто ${server.engine.clientsCount}`
