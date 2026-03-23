import type { FC } from "react";
import "../styles/about-styles.css";

export const AboutPage: FC = () => {
  return (
    <>
      <div className="about-page">
        <div className="about-container">
          <h2 className="about-title">Об игре</h2>
          <p className="about-text">
            Добро пожаловать в игру «Крокодил». Здесь вам необходимо попытаться
            изобразить загаданное слово. На попытку дается ограниченное время.
          </p>
          <p className="about-text">
            Правилами игры запрещено писать слово целиком или его части текстом
            на канвасе для рисования.
          </p>
          <p className="about-text">
            Игроки, которые пытаются отгадать слово, должны предлагать свои
            варианты в чате справа.
          </p>
          <p className="about-text">
            Чтобы выиграть раунд, нужно написать слово точно так, как оно было
            загадано.
          </p>
          <p className="about-text">
            Первый угадавший становится новым ведущим. Если время вышло —
            ведущий меняется автоматически.
          </p>
          <p className="about-text highlight">Удачи и веселой игры!</p>
        </div>
      </div>
    </>
  );
};
