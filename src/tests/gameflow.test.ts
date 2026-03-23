import { Server } from "socket.io";
import { Gameflow, type GameState } from "../base/gameflow";
import type { Message } from "../types";

vi.mock("../utils.ts", () => ({
  getRandomWord: vi.fn(async () => "word"),
}));

function createMockServer() {
  return {
    emit: vi.fn(),
    to: vi.fn().mockReturnThis(),
  } as unknown as Server;
}

interface GameflowPrototype {
  players: string[];
  nicknames: Record<string, string>;
  gamePhase: string;
  winnerIndex: number;
  currentDrawerIndex: number;
  currentWord: string;
  timeLeft: number;
  roundDuration: number;
  emitAllCurrentState: () => void;
  emitGameHost: (isGameHost: boolean) => void;
  startTimer: () => void;
  startNewRound: () => void;
  endRound: (reason: string, winnerId?: string) => void;
  getDrawerId: () => string | null;
  getCurrentState: () => GameState;
  clearTimer: () => void;
}

describe("Gameflow: start game", () => {
  let server: Server;
  let gameflow: Gameflow;
  const lang = "en";

  const players = (gameflow: Gameflow) =>
    (gameflow as unknown as GameflowPrototype).players;
  const nicknames = (gameflow: Gameflow) =>
    (gameflow as unknown as GameflowPrototype).nicknames;

  beforeEach(() => {
    server = createMockServer();
    gameflow = new Gameflow(server);

    gameflow.startNewRound = vi.fn();
    vi.clearAllMocks();
  });

  it("player added in game", () => {
    gameflow.startPlay("111", "Player", lang);

    expect(players(gameflow)).toContain("111");
    expect(nicknames(gameflow)["111"]).toBe("Player");
  });

  it("only first player start round", () => {
    gameflow.startPlay("111", "Player", lang);
    (gameflow as unknown as GameflowPrototype).gamePhase = "playing";
    gameflow.startPlay("222", "PlayerNew", lang);

    expect(gameflow.startNewRound).toHaveBeenCalled();
  });

  it("new player get current state game", () => {
    gameflow.startPlay("111", "Player1", lang);
    expect(server.to).toHaveBeenCalledWith("111");
    expect(server.emit).toHaveBeenCalledWith(
      "updatedGameState",
      expect.objectContaining({
        currentDrawerId: null,
        gamePhase: expect.any(String),
        timeLeft: expect.any(Number),
      }),
    );
  });
});

describe("Gameflow: start round", () => {
  let server: Server;
  let gameflow: Gameflow;

  beforeEach(() => {
    server = createMockServer();
    gameflow = new Gameflow(server);

    (gameflow as unknown as GameflowPrototype).emitAllCurrentState = vi.fn();
    (gameflow as unknown as GameflowPrototype).emitGameHost = vi.fn();
    (gameflow as unknown as GameflowPrototype).startTimer = vi.fn();
  });

  it("should not start round if already running", async () => {
    (gameflow as unknown as GameflowPrototype).gamePhase = "loadingRound";
    await gameflow.startNewRound();

    expect(
      (gameflow as unknown as GameflowPrototype).emitAllCurrentState,
    ).not.toHaveBeenCalled();
    expect(
      (gameflow as unknown as GameflowPrototype).emitGameHost,
    ).not.toHaveBeenCalled();
    expect(
      (gameflow as unknown as GameflowPrototype).startTimer,
    ).not.toHaveBeenCalled();
  });

  it("winner of the previous round should become host", async () => {
    (gameflow as unknown as GameflowPrototype).players = ["111", "222", "333"];
    (gameflow as unknown as GameflowPrototype).gamePhase = "notActive";
    (gameflow as unknown as GameflowPrototype).winnerIndex = 2;

    await gameflow.startNewRound();
    expect((gameflow as unknown as GameflowPrototype).currentDrawerIndex).toBe(
      2,
    );
  });

  it("if no winner, next after drawer in list should become host", async () => {
    (gameflow as unknown as GameflowPrototype).players = ["111", "222", "333"];
    (gameflow as unknown as GameflowPrototype).gamePhase = "notActive";
    (gameflow as unknown as GameflowPrototype).winnerIndex = -1;
    (gameflow as unknown as GameflowPrototype).currentDrawerIndex = 2;

    await gameflow.startNewRound();
    expect((gameflow as unknown as GameflowPrototype).currentDrawerIndex).toBe(
      0,
    );
  });

  it("should set random word", async () => {
    (gameflow as unknown as GameflowPrototype).players = ["111", "222", "333"];
    (gameflow as unknown as GameflowPrototype).gamePhase = "notActive";

    await gameflow.startNewRound();
    expect((gameflow as unknown as GameflowPrototype).currentWord).toBe("word");
  });
});

describe("Gameflow: remove player", () => {
  let server: Server;
  let gameflow: Gameflow;
  const lang = "en";

  const players = (gameflow: Gameflow) =>
    (gameflow as unknown as GameflowPrototype).players;
  const nicknames = (gameflow: Gameflow) =>
    (gameflow as unknown as GameflowPrototype).nicknames;

  beforeEach(() => {
    server = createMockServer();
    gameflow = new Gameflow(server);

    gameflow.startNewRound = vi.fn();
    gameflow.stopGame = vi.fn();
    (gameflow as unknown as GameflowPrototype).endRound = vi.fn();
    vi.clearAllMocks();
  });

  it("should remove player", () => {
    gameflow.startPlay("111", "Player1", lang);
    gameflow.startPlay("222", "Player2", lang);

    gameflow.removePlayer("111");

    expect(players(gameflow)).toEqual(["222"]);
    expect(nicknames(gameflow)).toEqual({ 222: "Player2" });
  });

  it("should stop game if removed last player", () => {
    gameflow.startPlay("111", "Player1", lang);
    gameflow.removePlayer("111");

    expect(players(gameflow)).toEqual([]);
    expect(nicknames(gameflow)).toEqual({});
    expect(gameflow.stopGame).toHaveBeenCalled();
    expect(
      (gameflow as unknown as GameflowPrototype).endRound,
    ).not.toHaveBeenCalled();
  });

  it("should end round if drawer left game", () => {
    gameflow.startPlay("111", "Player1", lang);
    gameflow.startPlay("222", "Player2", lang);
    (gameflow as unknown as GameflowPrototype).currentDrawerIndex = 0;
    gameflow.removePlayer("111");

    expect(
      (gameflow as unknown as GameflowPrototype).endRound,
    ).toHaveBeenCalled();
  });

  it("should recalculated drawer index if removed before drawing in queue", () => {
    gameflow.startPlay("111", "Player1", lang);
    gameflow.startPlay("222", "Player2", lang);
    gameflow.startPlay("333", "Player3", lang);
    (gameflow as unknown as GameflowPrototype).currentDrawerIndex = 2;
    gameflow.removePlayer("111");

    expect((gameflow as unknown as GameflowPrototype).currentDrawerIndex).toBe(
      1,
    );
  });
});

describe("Gameflow: check word", () => {
  let server: Server;
  let gameflow: Gameflow;
  const lang = "en";

  beforeEach(() => {
    server = createMockServer();
    gameflow = new Gameflow(server);

    gameflow.startNewRound = vi.fn();
    (gameflow as unknown as GameflowPrototype).endRound = vi.fn();
    vi.clearAllMocks();
  });

  it("should do nothing if the word in message don't match", () => {
    gameflow.startPlay("111", "Player1", lang);
    (gameflow as unknown as GameflowPrototype).currentWord = "word";
    const msg: Message = {
      userId: "111",
      userName: "Player",
      text: "wrong",
    };
    gameflow.checkGuess(msg);
    expect(
      (gameflow as unknown as GameflowPrototype).endRound,
    ).not.toHaveBeenCalled();
  });

  it("should end round if the word in message match", () => {
    gameflow.startPlay("111", "Player1", lang);
    (gameflow as unknown as GameflowPrototype).currentWord = "word";
    const msg: Message = {
      userId: "111",
      userName: "Player",
      text: "WoRd",
    };
    gameflow.checkGuess(msg);
    expect(
      (gameflow as unknown as GameflowPrototype).endRound,
    ).toHaveBeenCalled();
  });
});

describe("Gameflow: timer", () => {
  let server: Server;
  let gameflow: Gameflow;

  beforeEach(() => {
    server = createMockServer();
    gameflow = new Gameflow(server);

    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should set roundDuration and emit time", () => {
    (gameflow as unknown as GameflowPrototype).startTimer();

    expect((gameflow as unknown as GameflowPrototype).timeLeft).toBe(60);
    expect(server.emit).toHaveBeenCalledWith("timeUpdate", 60);
    expect(server.emit).toHaveBeenCalledTimes(1);
  });

  it("should emit timeUpdate every second", () => {
    (gameflow as unknown as GameflowPrototype).startTimer();

    vi.advanceTimersByTime(1000);
    expect((gameflow as unknown as GameflowPrototype).timeLeft).toBe(59);
    expect(server.emit).toHaveBeenCalledWith("timeUpdate", 59);

    vi.advanceTimersByTime(2000);
    expect((gameflow as unknown as GameflowPrototype).timeLeft).toBe(57);
    expect(server.emit).toHaveBeenCalledWith("timeUpdate", 57);
  });

  it("should end round when zero time left", () => {
    (gameflow as unknown as GameflowPrototype).endRound = vi.fn();
    (gameflow as unknown as GameflowPrototype).roundDuration = 1;
    (gameflow as unknown as GameflowPrototype).startTimer();

    vi.advanceTimersByTime(2000);

    expect((gameflow as unknown as GameflowPrototype).timeLeft).toBe(-1);
    expect(
      (gameflow as unknown as GameflowPrototype).endRound,
    ).toHaveBeenCalledWith("Время вышло :(, новый раунд");
  });
});

describe("Gameflow: get current state", () => {
  let server: Server;
  let gameflow: Gameflow;

  beforeEach(() => {
    server = createMockServer();
    gameflow = new Gameflow(server);

    (gameflow as unknown as GameflowPrototype).getDrawerId = vi
      .fn()
      .mockReturnValue("111");
    vi.clearAllMocks();
  });

  it("should return correct game state", () => {
    (gameflow as unknown as GameflowPrototype).gamePhase = "playing";
    (gameflow as unknown as GameflowPrototype).timeLeft = 4;

    const state = (gameflow as unknown as GameflowPrototype).getCurrentState();

    expect(state).toEqual({
      currentDrawerId: "111",
      gamePhase: "playing",
      timeLeft: 4,
    });

    (gameflow as unknown as GameflowPrototype).gamePhase = "notActive";
    (gameflow as unknown as GameflowPrototype).timeLeft = 0;

    const state2 = (gameflow as unknown as GameflowPrototype).getCurrentState();

    expect(state2).toEqual({
      currentDrawerId: "111",
      gamePhase: "notActive",
      timeLeft: 0,
    });
  });
});

describe("Gameflow: get drawer id", () => {
  let server: Server;
  let gameflow: Gameflow;
  const lang = "en";

  beforeEach(() => {
    server = createMockServer();
    gameflow = new Gameflow(server);

    gameflow.startNewRound = vi.fn();
    vi.clearAllMocks();
  });

  it("should return null if currentDrawerIndex is -1", () => {
    (gameflow as unknown as GameflowPrototype).currentDrawerIndex = -1;

    const result = (gameflow as unknown as GameflowPrototype).getDrawerId();
    expect(result).toBeNull();
  });

  it("should return player id who is drawer", () => {
    gameflow.startPlay("111", "Player1", lang);
    gameflow.startPlay("222", "Player2", lang);

    (gameflow as unknown as GameflowPrototype).currentDrawerIndex = 1;
    const result = (gameflow as unknown as GameflowPrototype).getDrawerId();

    expect(result).toBe("222");
  });
});

describe("Gameflow: emit game host", () => {
  let server: Server;
  let gameflow: Gameflow;

  beforeEach(() => {
    server = createMockServer();
    gameflow = new Gameflow(server);

    gameflow.startNewRound = vi.fn();
    vi.clearAllMocks();
  });

  it("should emit word if player is game host", () => {
    vi.spyOn(
      gameflow as unknown as GameflowPrototype,
      "getDrawerId",
    ).mockReturnValue("111");
    (gameflow as unknown as GameflowPrototype).currentWord = "word";

    (gameflow as unknown as GameflowPrototype).emitGameHost(true);

    expect(server.to).toHaveBeenCalledWith("111");
    expect(server.emit).toHaveBeenCalledWith("gameHost", "word");
  });

  it("should emit null if player is not game host", () => {
    vi.spyOn(
      gameflow as unknown as GameflowPrototype,
      "getDrawerId",
    ).mockReturnValue("111");

    (gameflow as unknown as GameflowPrototype).emitGameHost(false);

    expect(server.emit).toHaveBeenCalledWith("gameHost", null);
  });

  it("should not emit if drawerId is null", () => {
    vi.spyOn(
      gameflow as unknown as GameflowPrototype,
      "getDrawerId",
    ).mockReturnValue(null);

    (gameflow as unknown as GameflowPrototype).emitGameHost(true);

    expect(server.to).not.toHaveBeenCalled();
    expect(server.emit).not.toHaveBeenCalled();
  });
});

describe("GameFlow: end round", () => {
  let server: Server;
  let gameflow: Gameflow;

  beforeEach(() => {
    server = createMockServer();
    gameflow = new Gameflow(server);

    (gameflow as unknown as GameflowPrototype).players = ["111", "222", "333"];
    (gameflow as unknown as GameflowPrototype).nicknames = { 222: "Player2" };
    (gameflow as unknown as GameflowPrototype).currentWord = "word";

    gameflow.startNewRound = vi.fn();
    (gameflow as unknown as GameflowPrototype).clearTimer = vi.fn();
    (gameflow as unknown as GameflowPrototype).emitGameHost = vi.fn();
    vi.clearAllMocks();
  });

  it("should emit end round, reset host and time, start new round", () => {
    (gameflow as unknown as GameflowPrototype).endRound("reason");

    expect(server.emit).toHaveBeenCalledWith("endRound");
    expect(
      (gameflow as unknown as GameflowPrototype).clearTimer,
    ).toHaveBeenCalled();
    expect(
      (gameflow as unknown as GameflowPrototype).emitGameHost,
    ).toHaveBeenCalledWith(false);
    expect(
      (gameflow as unknown as GameflowPrototype).startNewRound,
    ).toHaveBeenCalled();
  });

  it("if have winner, set winner and emit all", () => {
    (gameflow as unknown as GameflowPrototype).endRound("Слово угадано", "222");

    expect(server.emit).toHaveBeenCalledWith(
      "newMsg",
      expect.objectContaining({
        userId: "admin",
        userName: "Крокодил",
        text: `${(gameflow as unknown as GameflowPrototype).nicknames["222"]} отгадал "word"`,
      }),
    );

    expect((gameflow as unknown as GameflowPrototype).winnerIndex).toBe(1);
  });

  it("if have not winner, set winner -1 and emit all", () => {
    (gameflow as unknown as GameflowPrototype).endRound("Время вышло");

    expect(server.emit).toHaveBeenCalledWith(
      "newMsg",
      expect.objectContaining({
        userId: "admin",
        userName: "Крокодил",
        text: "Время вышло",
      }),
    );

    expect((gameflow as unknown as GameflowPrototype).winnerIndex).toBe(-1);
  });
});
