import { Server } from "socket.io";
import { GamesManager } from "../base/gamesManager";
import { Gameflow } from "../base/gameflow";

function createMockServer() {
  return {
    emit: vi.fn(),
    to: vi.fn(),
  } as unknown as Server;
}

describe("GamesManager", () => {
  let server: Server;
  let manager: GamesManager;
  const lang = "en";

  beforeEach(() => {
    server = createMockServer();
    manager = new GamesManager(server);

    vi.clearAllMocks();
  });

  it("should create game if it does not exist", () => {
    const game = manager.getGame(lang);
    expect(game).toBeInstanceOf(Gameflow);
    expect(manager["games"][lang]).toBe(game);
  });

  it("should return existing game if it already exists", () => {
    const game1 = manager.getGame(lang);
    const game2 = manager.getGame(lang);
    expect(game1).toBe(game2);
  });

  it("should remove a player from a game", () => {
    const game = manager.getGame(lang);
    game.removePlayer = vi.fn().mockReturnValue(true);

    manager.removePlayer("111");
    expect(game.removePlayer).toHaveBeenCalledWith("111");
  });
});
