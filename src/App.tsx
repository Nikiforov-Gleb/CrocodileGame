import { Canvas } from "./components/Canvas";
import { Chat } from "./components/Chat";

import "./styles/styles.css";

function App() {
  return (
    <div className="app">
      <header>
        <div className="container">
          <p>Hello world!!</p>
        </div>
      </header>
      <div className="desktop-container">
        <Canvas />
        <Chat />
      </div>
    </div>
  );
}

export default App;
