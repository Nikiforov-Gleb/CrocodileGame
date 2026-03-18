vi.mock("../../styles/game-styles.css", () => ({}));

vi.mock("../../server/socket", () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    id: "111",
  },
}));

vi.mock("../../base/userData", () => ({
  UserData: { nickname: "Player" },
}));

import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { Chat } from "../../components/Chat";
import { store } from "../../store/store";
import { setGameState } from "../../features/gameflowSlice";
import { socket } from "../../server/socket";

describe("Chat: is not host", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should disable input and button if is  host", () => {
    store.dispatch(
      setGameState({
        currentDrawerId: "111",
        gamePhase: "loadingRound",
        timeLast: 30,
        socketId: "111",
      }),
    );

    render(
      <Provider store={store}>
        <Chat />
      </Provider>,
    );
    expect(screen.getByPlaceholderText("Введите сообщение")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
  });
});

describe("Chat: is not host", () => {
  beforeEach(() => {
    store.dispatch(
      setGameState({
        currentDrawerId: "222",
        gamePhase: "playing",
        timeLast: 30,
        socketId: "111",
      }),
    );

    render(
      <Provider store={store}>
        <Chat />
      </Provider>,
    );
    vi.clearAllMocks();
  });

  it("should enable input and button if is not host", () => {
    expect(screen.getByPlaceholderText("Введите сообщение")).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Отправить" }),
    ).not.toBeDisabled();
  });

  it("should send message on form submit and clear input", () => {
    const input = screen.getByPlaceholderText("Введите сообщение");
    const button = screen.getByRole("button", { name: "Отправить" });

    fireEvent.change(input, { target: { value: "word" } });
    fireEvent.click(button);

    expect(socket.emit).toHaveBeenCalledWith("chatMessage", "word", "Player");
    expect(input).toHaveValue("");
  });
});
