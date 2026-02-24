import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const server = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

server.on("connection", (socket) => {
  socket.on("chatMessage", (msg) => {
    console.log(msg);
  });
});

httpServer.listen(3001, () => {
  console.log("Server is running");
});
