import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { GamePhase } from "../types";

export interface GameState {
  currentDrawerId: string | null;
  word: string | null;
  gamePhase: GamePhase;
  timeLast: number;
  isHost: boolean;
}

const initialState: GameState = {
  currentDrawerId: null,
  word: null,
  timeLast: 0,
  gamePhase: "notActive",
  isHost: false,
};

export const gameflowSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameState: (
      state,
      action: PayloadAction<Omit<GameState, "word"> & { socketId: string }>,
    ) => {
      state.currentDrawerId = action.payload.currentDrawerId;
      state.gamePhase = action.payload.gamePhase;
      state.timeLast = action.payload.timeLast;
      state.isHost = state.currentDrawerId === action.payload.socketId;
    },

    setLastTime: (state, action: PayloadAction<number>) => {
      state.timeLast = action.payload;
    },

    setNewWord: (state, action: PayloadAction<string>) => {
      state.word = action.payload;
    },
  },
});

export const { setGameState, setLastTime, setNewWord } = gameflowSlice.actions;
export const gameReducer = gameflowSlice.reducer;
