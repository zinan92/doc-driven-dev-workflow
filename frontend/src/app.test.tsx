import { render, screen } from "@testing-library/react";
import App from "./app";

test("renders three-column workflow cockpit shell", () => {
  render(<App />);
  expect(screen.getByText(/workflow driven developer/i)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Tasks" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Workflow Canvas" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Inspector" })).toBeInTheDocument();
});
