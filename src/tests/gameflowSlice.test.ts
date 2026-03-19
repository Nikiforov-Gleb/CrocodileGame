import {
  gameflowSlice,
  setGameState,
  setLastTime,
  setNewWord,
  type GameState,
} from "../features/gameflowSlice";

describe("gameflow slice", () => {
  const initialState: GameState = {
    language: "en",
    currentDrawerId: null,
    word: null,
    timeLast: 0,
    gamePhase: "notActive",
    isHost: false,
  };

  it("should return initial state", () => {
    expect(gameflowSlice.reducer(undefined, { type: "unknown" })).toEqual(
      initialState,
    );
  });

  it("should update game state and set isHost false when currentDrawerId does not match socketId", () => {
    const payload = {
      language: "en",
      currentDrawerId: "12345",
      gamePhase: "active" as GameState["gamePhase"],
      timeLast: 60,
      socketId: "54321",
    };

    const action = setGameState(payload);
    const result = gameflowSlice.reducer(initialState, action);

    expect(result).toEqual({
      language: "en",
      currentDrawerId: "12345",
      word: null,
      gamePhase: "active",
      timeLast: 60,
      isHost: false,
    });
  });

  it("should update timeLast", () => {
    const action = setLastTime(30);
    const result = gameflowSlice.reducer(initialState, action);

    expect(result).toEqual({
      ...initialState,
      timeLast: 30,
    });
  });

  it("should update word", () => {
    const action = setNewWord("apple");
    const result = gameflowSlice.reducer(initialState, action);

    expect(result).toEqual({
      ...initialState,
      word: "apple",
    });
  });
});
