import { useEffect, type FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/styles.css";
import logo from "../assets/crocodile_logo.svg";
import { socket } from "../server/socket";

export const Header: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const isAboutPage = location.pathname === "/about";

  useEffect(() => {
    if (location.pathname === "/") {
      socket.emit("leftGame");
    }
  }, [location.pathname]);

  const handleBackBtn = () => {
    navigate(-1);
  };

  return (
    <header>
      <div className="container header-container">
        {!isHomePage &&
          (isAboutPage ? (
            <button className="header-main-btn" onClick={handleBackBtn}>
              Назад
            </button>
          ) : (
            <Link to="/" className="header-main-btn">
              <button>На главную</button>
            </Link>
          ))}

        <div className="header-center">
          <img src={logo} alt="logo" className="header-logo" />
          <h1>Крокодил</h1>
        </div>

        <Link to="/about" className="header-about-btn">
          <button>Об игре</button>
        </Link>
      </div>
    </header>
  );
};
