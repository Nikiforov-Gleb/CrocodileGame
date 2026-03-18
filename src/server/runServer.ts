import { createServer } from "http";
import { createSocketServer } from "./server.ts";

const httpServer = createServer();
createSocketServer(httpServer);
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log("Server is running");
});
