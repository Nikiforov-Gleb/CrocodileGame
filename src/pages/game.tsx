import type { FC } from "react";

import { Game } from "../components/Game";
import { Chat } from "../components/Chat";

export const GamePage: FC = () => {
  return (
    <>
      <div className="desktop-container">
        <Game />
        <Chat />
      </div>
    </>
  );
};
