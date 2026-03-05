import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { BrowserRouter } from "react-router-dom";

describe("App component", () => {
  test("renders Hello world text", () => {
    render(
      <Provider store={store}>
        й
        <App />
      </Provider>,
      { wrapper: BrowserRouter },
    );

    screen.debug();
    const element = screen.getByText(/Крокодил/i);
    expect(element).toBeInTheDocument();
  });
});
