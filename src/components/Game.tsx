import "../styles/game-styles.css";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store.ts";
import {
  setNewWord,
  setGameState,
  type GameState,
} from "../features/gameflowSlice.ts";
import { socket } from "../server/socket.ts";
import { Canvas } from "./Canvas";
import { Timer } from "./Timer.tsx";
import { UserData } from "../base/userData";

export const Game = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [clearFn, setClearFn] = useState<(needEmit?: boolean) => void>();
  const word = useSelector((state: RootState) => state.gameflow.word);
  const isHost = useSelector((state: RootState) => state.gameflow.isHost);
  const gamePhase = useSelector((state: RootState) => state.gameflow.gamePhase);

  useEffect(() => {
    socket.emit("joinGame", { nickname: UserData.nickname });
  }, []);

  useEffect(() => {
    const handleGameHost = (word: string) => {
      dispatch(setNewWord(word));
    };

    const handleUpdateState = (gameState: GameState) => {
      if (!socket.id) return;
      dispatch(setGameState({ ...gameState, socketId: socket.id }));
    };

    socket.on("gameHost", handleGameHost);
    socket.on("updatedGameState", handleUpdateState);
    socket.on("endRound", () => clearFn?.(false));

    return () => {
      socket.off("gameHost", handleGameHost);
      socket.off("updatedGameState", handleUpdateState);
    };
  }, [dispatch, clearFn]);

  return (
    <div className="game-container">
      <Canvas getMethods={setClearFn} />
      <div className="panel">
        <button
          className="clear-button"
          disabled={!isHost}
          onClick={() => clearFn?.(true)}
        >
          Очистить
        </button>
        <span className="guessed-word">
          {gamePhase === "loadingRound" ? "Загадываем слово..." : (word ?? "")}
        </span>
        <Timer />
      </div>
    </div>
  );
};
