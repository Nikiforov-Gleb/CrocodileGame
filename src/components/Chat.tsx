import "../styles/chat-styles.css";
import { socket } from "../server/socket.ts";
import { useState, useEffect } from "react";
import type { Message } from "../types.ts";
import { UserData } from "../base/userData";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store.ts";

export const Chat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const canWrite = !useSelector((state: RootState) => state.gameflow.isHost);

  useEffect(() => {
    const handleNewMsg = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("newMsg", handleNewMsg);

    return () => {
      socket.off("newMsg", handleNewMsg);
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    socket.emit("chatMessage", input, UserData.nickname);
    setInput("");
  };

  return (
    <div className="container-chat">
      <div className="messages-area" id="messages">
        {messages.map((msg, i) => {
          const isSelf = msg.userId === socket.id;
          return (
            <div key={i} className={`message ${isSelf ? "self" : "other"}`}>
              <span className="username">{msg.userName}:</span>
              <span className="text">{msg.text}</span>
            </div>
          );
        })}
      </div>
      <form
        className="input-area"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          placeholder="Введите сообщение"
          autoComplete="off"
          required
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!canWrite}
        />
        <button type="submit" disabled={!canWrite}>
          Отправить
        </button>
      </form>
    </div>
  );
};
