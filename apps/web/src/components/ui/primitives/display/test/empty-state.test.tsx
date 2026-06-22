import { render, screen, fireEvent } from "@testing-library/react";
import type { LucideIcon } from "lucide-react";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  const DummyIcon = (props: { size?: number; className?: string }) => <svg data-testid="dummy-icon" {...props} />;

  it("renders correctly with title and description", () => {
    render(<EmptyState title="No databases found" description="Create a new database to get started" />);
    expect(screen.getByText("No databases found")).toBeInTheDocument();
    expect(screen.getByText("Create a new database to get started")).toBeInTheDocument();
    expect(screen.queryByTestId("dummy-icon")).not.toBeInTheDocument();
  });

  it("renders icon if provided", () => {
    render(<EmptyState title="Empty" icon={DummyIcon as unknown as LucideIcon} />);
    const icon = screen.getByTestId("dummy-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-ink-muted");
  });

  it("renders action button and triggers callback on click", () => {
    const handleActionClick = jest.fn();
    render(
      <EmptyState
        title="Empty"
        action={{
          label: "Add Item",
          onClick: handleActionClick,
        }}
      />,
    );

    const button = screen.getByRole("button", { name: "Add Item" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleActionClick).toHaveBeenCalledTimes(1);
  });
});
