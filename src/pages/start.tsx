import "../styles/start-style.css";

import type { FC } from "react";
import { useState } from "react";
import { UserData } from "../base/userData";
import { useNavigate } from "react-router-dom";
import { languages } from "../languages";

export const StartPage: FC = () => {
  const [nameInput, setNameInput] = useState(UserData.nickname || "");
  const [selectedLang, setSelectedLang] = useState("en");
  const navigate = useNavigate();

  const handleStartGame = () => {
    const trimmedName = nameInput.trim();
    if (!trimmedName) return;

    UserData.setNickname(trimmedName);
    navigate(`/game/${selectedLang}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setSelectedLang(lang);
  };

  return (
    <>
      <div className="container start">
        <h1>Добро пожаловать!</h1>
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
        <div className="select-wrapper">
          <label htmlFor="lang">Язык слов:</label>
          <select value={selectedLang} onChange={handleChange}>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <button className="start" onClick={handleStartGame} disabled={!nameInput.trim()}>
          Начать игру
        </button>
      </div>
    </>
  );
};
