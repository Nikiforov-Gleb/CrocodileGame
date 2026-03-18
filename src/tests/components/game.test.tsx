type MockSocket = {
  _handlers?: Record<string, (...args: unknown[]) => void>;
};

const mockSocket = socket as MockSocket;

vi.mock("../../server/socket", () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      mockSocket._handlers = mockSocket._handlers || {};
      mockSocket._handlers[event] = cb;
    }),
    off: vi.fn(),
    id: "111",
  },
}));

vi.mock("../../base/userData", () => ({
  UserData: { nickname: "Player" },
}));

vi.mock("../../styles/game-styles.css", () => ({}));

import { act, render, screen, waitFor } from "@testing-library/react";
import { socket } from "../../server/socket";
import { Provider } from "react-redux";
import { Game } from "../../components/Game";
import { setGameState, setNewWord } from "../../features/gameflowSlice";
import { store } from "../../store/store";

describe("Game component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should emit join game on start", async () => {
    render(
      <Provider store={store}>
        <Game />
      </Provider>,
    );
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith("joinGame", {
        nickname: "Player",
      });
    });
  });

  it("shows loading text during loadingRound", async () => {
    store.dispatch(
      setGameState({
        currentDrawerId: "222",
        gamePhase: "loadingRound",
        timeLast: 30,
        socketId: "111",
      }),
    );

    render(
      <Provider store={store}>
        <Game />
      </Provider>,
    );

    expect(screen.getByText(/Загадываем слово.../i)).toBeInTheDocument();
  });
});

describe("Game component: is not host", () => {
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
        <Game />
      </Provider>,
    );

    vi.clearAllMocks();
  });

  it("clear btn should disabled if not host", () => {
    const clearBtn = screen.getByRole("button", { name: /Очистить/i });
    expect(clearBtn).toBeDisabled();
  });

  it("should set word null when get emit gameHost(null) and not show word", async () => {
    store.dispatch(setNewWord("word"));

    const handlers = mockSocket._handlers;
    if (!handlers) {
      throw new Error("Handlers not initialized");
    }
    await act(async () => {
      handlers["gameHost"](null);
      await Promise.resolve();
    });

    expect(screen.queryByText("word")).not.toBeInTheDocument();
  });
});

describe("Game component: is host", () => {
  beforeEach(() => {
    store.dispatch(
      setGameState({
        currentDrawerId: "111",
        gamePhase: "playing",
        timeLast: 30,
        socketId: "111",
      }),
    );

    store.dispatch(setNewWord("word"));

    render(
      <Provider store={store}>
        <Game />
      </Provider>,
    );
    vi.clearAllMocks();
  });

  it("clear btn should enabled if host", () => {
    const clearBtn = screen.getByRole("button", { name: /Очистить/i });
    expect(clearBtn).toBeEnabled();
  });

  it("should update word when get emit gameHost and show word", () => {
    const handlers = mockSocket._handlers;
    if (!handlers) {
      throw new Error("Handlers not initialized");
    }

    handlers["gameHost"]("word");

    expect(screen.getByText("word")).toBeInTheDocument();
  });
});
