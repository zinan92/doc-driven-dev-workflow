import { render, screen } from "@testing-library/react";
import App from "./app";

test("renders three-column workflow cockpit shell", () => {
  render(<App />);
  expect(screen.getByText(/workflow driven developer/i)).toBeInTheDocument();
  expect(screen.getByText(/tasks/i)).toBeInTheDocument();
  expect(screen.getByText(/workflow canvas/i)).toBeInTheDocument();
  expect(screen.getByText(/inspector/i)).toBeInTheDocument();
});
