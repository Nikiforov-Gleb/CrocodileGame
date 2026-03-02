import "../styles/start-style.css";

import type { FC } from "react";
import { useState } from "react";
import { UserData } from "../base/userData";
import { useNavigate } from "react-router-dom";

export const StartPage: FC = () => {
  const [nameInput, setNameInput] = useState(UserData.nickname || "");
  const navigate = useNavigate();

  const handleStartGame = () => {
    const trimmedName = nameInput.trim();
    if (!trimmedName) return;

    UserData.setNickname(trimmedName);
    navigate("/game");
  };
  return (
    <>
      <div className="container start">
        <div className="input-wrapper">
          <label htmlFor="nickname">Ваш ник:</label>
          <input
            type="text"
            id="nameInput"
            value={nameInput}
            onChange={(e) => setNameInput(e.currentTarget.value)}
            placeholder="Введите ник"
          />
        </div>
        <button onClick={handleStartGame} disabled={!nameInput.trim()}>
          Начать игру
        </button>
      </div>
    </>
  );
};
