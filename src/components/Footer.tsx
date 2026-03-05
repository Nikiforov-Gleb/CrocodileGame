import type { FC } from "react";
import "../styles/styles.css";

export const Footer: FC = () => {
  return (
    <footer>
      <div className="container">
        <p>
          Crocodile game App &copy;
          <script>document.write(new Date().getFullYear());</script>
        </p>
        <p>Randow words provided by RandomWordAPI</p>
      </div>
    </footer>
  );
};
