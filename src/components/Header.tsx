import type { FC } from "react";
import { Link } from "react-router-dom";
import "../styles/styles.css";

export const Header: FC = () => {
  return (
    <header>
      <div className="container">
        <p>Крокодил</p>
      </div>
      <Link to="/about">
        <button>Об игре</button>
      </Link>
    </header>
  );
};
