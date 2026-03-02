import "../styles/game-styles.css";
import { useState } from "react";
import { Canvas } from "../components/Canvas";

export const Game = () => {
  const [clearFn, setClearFn] = useState<(needEmit?: boolean) => void>();

  return (
    <div className="game-container">
      <Canvas getMethods={setClearFn} />
      <div className="panel">
        <button className="clear-button" onClick={() => clearFn?.(true)}>
          Очистить
        </button>
        <span className="guessed-word">Слово</span>
        <span className="guessed-word">ТАймер</span>
      </div>
    </div>
  );
};
