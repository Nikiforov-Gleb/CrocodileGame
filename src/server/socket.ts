import { io } from "socket.io-client";

//export const socket = io("http://localhost:3001");
// export const socket = io("http://192.168.0.105:3001");

const SERVER_URL =
  import.meta.env.REACT_APP_SERVER_URL || "http://localhost:3001";
export const socket = io(SERVER_URL);
