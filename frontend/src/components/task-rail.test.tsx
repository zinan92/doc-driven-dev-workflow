import { render, screen } from "@testing-library/react";
import { TaskRail } from "./task-rail";

test("renders available workflow snapshots", () => {
  render(
    <TaskRail
      tasks={[
        { id: "example-task", label: "Example Task", status: "done", sourceDir: "examples/example-task" },
        { id: "medium-task", label: "Medium Task", status: "active", sourceDir: "examples/medium-example-task" },
      ]}
      selectedTaskId="medium-task"
      onSelect={() => {}}
    />,
  );

  expect(screen.getByText(/example task/i)).toBeInTheDocument();
  expect(screen.getByText(/medium task/i)).toBeInTheDocument();
  expect(screen.getByText(/tasks/i)).toBeInTheDocument();
});
