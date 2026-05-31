import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../button";

describe("Button", () => {
  it("renders correctly with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-accent", "text-white");
  });

  it("applies variant classes correctly", () => {
    const { rerender } = render(<Button variant="danger">Delete</Button>);
    let button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveClass("bg-error", "text-white");

    rerender(<Button variant="ghost">Ghost Button</Button>);
    button = screen.getByRole("button", { name: /ghost button/i });
    expect(button).toHaveClass("bg-transparent", "text-ink-secondary");

    rerender(<Button variant="secondary">Secondary Button</Button>);
    button = screen.getByRole("button", { name: /secondary button/i });
    expect(button).toHaveClass("bg-surface", "border", "border-stroke");
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole("button", { name: /small/i });
    expect(button).toHaveClass("px-3", "py-1.5", "text-xs");

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole("button", { name: /icon/i });
    expect(button).toHaveClass("p-1.5", "rounded-lg");
  });

  it("handles loading state correctly", () => {
    render(<Button loading>Submit</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
    expect(button.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it("handles disabled state correctly", () => {
    render(<Button disabled>Submit</Button>);
    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("opacity-70", "cursor-not-allowed");
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Click</Button>);
    const button = screen.getByRole("button", { name: /click/i });
    expect(button).toHaveClass("custom-class");
  });
});
