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

import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { Chat } from "../../components/Chat";
import { store } from "../../store/store";
import { setGameState } from "../../features/gameflowSlice";
import { socket } from "../../server/socket";
import type { Message } from "../../types";

describe("Chat", () => {
  it("should render self and admin messages correctly", async () => {
    let handler: ((msg: Message) => void) | undefined;

    vi.mocked(socket.on).mockImplementation((event, cb) => {
      if (event === "newMsg") {
        handler = cb;
      }
      return socket;
    });

    render(
      <Provider store={store}>
        <Chat />
      </Provider>,
    );

    await act(async () => {
      handler!({
        userId: "111",
        userName: "Me",
        text: "My msg",
      });

      handler!({
        userId: "admin",
        userName: "Admin",
        text: "Admin msg",
      });
    });

    const selfMsg = screen.getByText("My msg").closest(".message");
    const adminMsg = screen.getByText("Admin msg").closest(".message");

    expect(selfMsg).toHaveClass("self");
    expect(selfMsg).not.toHaveClass("other");

    expect(adminMsg).toHaveClass("admin");
  });
});

describe("Chat: is host", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should disable input and button if is  host", () => {
    store.dispatch(
      setGameState({
        language: "en",
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
        language: "en",
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

    expect(socket.emit).toHaveBeenCalledWith(
      "chatMessage",
      "word",
      "Player",
      "en",
    );
    expect(input).toHaveValue("");
  });
});
