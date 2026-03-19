import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { socket } from "../../server/socket";
import { Provider } from "react-redux";
import { store } from "../../store/store";

vi.mock("../../server/socket", () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

describe("Header", () => {
  it("should go to page About when click button About ", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    fireEvent.click(screen.getByText("Об игре"));
    expect(screen.getByText("Правила игры")).toBeInTheDocument();
  });

  it("should show only btn 'Об игре' if on main page", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.queryByText("На главную")).not.toBeInTheDocument();
    expect(screen.queryByText("Назад")).not.toBeInTheDocument();
    expect(screen.getByText("Об игре")).toBeInTheDocument();
  });

  it("on game page: show btn 'На главную', go to Main page when click, emit left game", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/game"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    const onMainBtn = screen.getByText("На главную");
    expect(onMainBtn).toBeInTheDocument();

    fireEvent.click(onMainBtn);
    expect(screen.getByText("Начать игру")).toBeInTheDocument();
    expect(socket.emit).toHaveBeenCalledWith("leftGame");
  });

  it("on about page: show btn 'Назад', go to previous page when click", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/", "/about"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    const backBtn = screen.getByText("Назад");
    expect(backBtn).toBeInTheDocument();

    fireEvent.click(backBtn);
    expect(screen.getByText("Начать игру")).toBeInTheDocument();
  });
});
