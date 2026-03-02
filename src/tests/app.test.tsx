import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

describe("App component", () => {
  test("renders Hello world text", () => {
    render(<App />);
    const element = screen.getByText(/Крокодил/i);
    expect(element).toBeInTheDocument();
  });
});
