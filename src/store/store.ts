import { configureStore } from "@reduxjs/toolkit";
import { gameReducer } from "../features/gameflowSlice";

export const store = configureStore({
  reducer: {
    gameflow: gameReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
