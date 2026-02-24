import { Canvas } from "./components/Canvas";
import { socket } from "./server/socket";

function App() {
  return (
    <div>
      <p>Hello world!!</p>
      <button onClick={sendMessage}>Send</button>
      <Canvas />
    </div>
  );
}

function sendMessage() {
  socket.emit("chatMessage", "test message");
}

export default App;
