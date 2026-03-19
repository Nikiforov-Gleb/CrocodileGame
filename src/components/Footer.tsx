import type { FC } from "react";
import "../styles/styles.css";

export const Footer: FC = () => {
  return (
    <footer>
      <div className="container">
        <p>
          Crocodile game App &copy;
          {new Date().getFullYear()}
        </p>
        <p>Randow words provided by RandomWordAPI</p>
      </div>
    </footer>
  );
};
