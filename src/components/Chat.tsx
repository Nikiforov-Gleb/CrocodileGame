import "../styles/chat-styles.css";
import { socket } from "../server/socket.ts";
import { useState, useEffect } from "react";
import type { Message } from "../types.ts";

export const Chat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

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
    socket.emit("chatMessage", input);
    setInput("");
  };

  return (
    <div className="container-chat">
      <div className="messages-area" id="messages">
        {messages.map((msg, i) => {
          const isSelf = msg.userId === socket.id;
          return (
            <div key={i} className={`message ${isSelf ? "self" : "other"}`}>
              <span className="username">{isSelf ? "Я" : "Игрок"}:</span>
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
        />
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
};
