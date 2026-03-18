const mockGameflow = {
  startPlay: vi.fn(),
  checkGuess: vi.fn(),
  removePlayer: vi.fn(),
};

vi.mock("../base/gameflow.ts", () => ({
  Gameflow: vi.fn(function () {
    return mockGameflow;
  }),
}));

import { createSocketServer } from "../server/server.ts";
import { io } from "socket.io-client";
import { createServer } from "http";
import type { Message, Point } from "../types.ts";

let httpServer: ReturnType<typeof createServer>;
let server: ReturnType<typeof createSocketServer>;
let client: ReturnType<typeof io>;
let port: number;

describe("Server with mocked Gameflow", () => {
  beforeAll(async () => {
    httpServer = createServer();
    server = createSocketServer(httpServer);

    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        const address = httpServer.address();

        if (!address || typeof address === "string") {
          throw new Error("Invalid address");
        }

        port = address.port;

        client = io(`http://localhost:${port}`);
        client.on("connect", () => resolve());
      });
    });
  });

  afterAll(() => {
    client.close();
    server.close();
    httpServer.close();
  });

  it("should connect client", () => {
    expect(client.connected).toBe(true);
  });

  it("should call start game when join", async () => {
    const nickname = "Player";
    client.emit("joinGame", { nickname });

    await new Promise((r) => setTimeout(r, 20));
    expect(mockGameflow.startPlay).toHaveBeenCalledWith(client.id, nickname);
  });

  it("should call check guess when new msg", async () => {
    const msg = "Test";
    const nickname = "Player";

    const newMsgPromise = new Promise<Message>((resolve) => {
      client.once("newMsg", resolve);
    });

    client.emit("chatMessage", msg, nickname);
    const receivedMsg = await newMsgPromise;

    expect(mockGameflow.checkGuess).toHaveBeenCalledTimes(1);
    expect(mockGameflow.checkGuess).toHaveBeenCalledWith({
      userId: client.id,
      userName: nickname,
      text: msg,
    });

    expect(receivedMsg).toEqual({
      userId: client.id,
      userName: nickname,
      text: msg,
    });
  });

  it("should broadcast drawing to other clients", async () => {
    const startPoint: Point = {
      x: 13,
      y: 15,
    };

    const endPoint: Point = {
      x: 13,
      y: 15,
    };

    const clientOther = io(`http://localhost:${port}`);
    await new Promise<void>((resolve) => clientOther.once("connect", resolve));

    const drawingPromise = new Promise<[Point, Point]>((resolve) => {
      clientOther.once("drawing", resolve);
    });

    let senderReceived: [Point, Point] | null = null;
    new Promise<boolean>((resolve) => {
      client.once("drawing", (data) => {
        senderReceived = data;
        resolve(true);
      });
    });

    client.emit("drawing", [startPoint, endPoint]);
    const received = await drawingPromise;
    expect(received).toEqual([startPoint, endPoint]);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(senderReceived).toBeNull();

    clientOther.close();
  });

  it("should calls removePlayer when left game", async () => {
    client.emit("leftGame");

    await new Promise((r) => setTimeout(r, 20));

    expect(mockGameflow.removePlayer).toHaveBeenCalledWith(client.id);
  });
});
