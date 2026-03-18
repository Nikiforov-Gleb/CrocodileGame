vi.mock("../../server/socket", () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    id: "111",
  },
}));
const mockedSocket = vi.mocked(socket);

vi.mock("../../styles/game-styles.css", () => ({}));

import { Provider } from "react-redux";
import { Canvas } from "../../components/Canvas";
import { store } from "../../store/store";
import { socket } from "../../server/socket";
import { fireEvent, render } from "@testing-library/react";
import { setGameState } from "../../features/gameflowSlice";

describe("Canvas", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("should render canvas and container", () => {
    store.dispatch(
      setGameState({
        currentDrawerId: "111",
        gamePhase: "playing",
        timeLast: 30,
        socketId: "111",
      }),
    );

    const renderResult = render(
      <Provider store={store}>
        <Canvas />
      </Provider>,
    );
    const container = renderResult.container;
    expect(container.querySelector("canvas")).toBeInTheDocument();
    expect(container.querySelector(".canvas-container")).toBeInTheDocument();
  });

  it("should call canvasActions on mouse events if host", async () => {
    store.dispatch(
      setGameState({
        currentDrawerId: "111",
        gamePhase: "playing",
        timeLast: 30,
        socketId: "111",
      }),
    );

    const renderResult = render(
      <Provider store={store}>
        <Canvas />
      </Provider>,
    );
    const container = renderResult.container;
    const canvasEl = container.querySelector("canvas")!;
    fireEvent.mouseDown(canvasEl, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvasEl, { clientX: 20, clientY: 20 });
    fireEvent.mouseUp(canvasEl);

    expect(socket.emit).toHaveBeenCalledWith("drawing", expect.any(Array));
  });

  it("should respond to socket events when not host", () => {
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
        <Canvas />
      </Provider>,
    );

    const drawingCall = mockedSocket.on.mock.calls.find(
      (call) => call[0] === "drawing",
    );
    const drawingCallback = drawingCall?.[1];
    drawingCallback?.([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ]);
    expect(socket.on).toHaveBeenCalledWith("drawing", expect.any(Function));

    const clearCall = mockedSocket.on.mock.calls.find(
      (call) => call[0] === "clearCanvas",
    );
    const clearCallback = clearCall?.[1];
    clearCallback?.();
    expect(socket.on).toHaveBeenCalledWith("clearCanvas", expect.any(Function));
  });
});
