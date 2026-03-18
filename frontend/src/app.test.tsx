import { render, screen } from "@testing-library/react";
import App from "./app";

test("renders workflow cockpit shell", () => {
  render(<App />);
  expect(screen.getByText(/workflow driven developer/i)).toBeInTheDocument();
  expect(screen.getByText(/workflow graph/i)).toBeInTheDocument();
});
