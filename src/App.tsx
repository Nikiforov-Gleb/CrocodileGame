import "./styles/styles.css";

import { Route, Routes } from "react-router";
import { StartPage } from "./pages/start";
import { GamePage } from "./pages/game";
import { AboutPage } from "./pages/about";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route index element={<StartPage />} />
        <Route path="game" element={<GamePage />} />
        <Route path="about" element={<AboutPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
