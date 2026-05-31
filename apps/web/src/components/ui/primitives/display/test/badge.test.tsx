import { render, screen } from "@testing-library/react";
import { Badge, StatusDot } from "../badge";

describe("Badge", () => {
  it("renders correctly with default props", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-elevated", "text-ink-secondary");
  });

  it("applies variant classes correctly", () => {
    const { rerender } = render(<Badge variant="accent">Accent</Badge>);
    let badge = screen.getByText("Accent");
    expect(badge).toHaveClass("bg-accent/10", "text-accent");

    rerender(<Badge variant="success">Success</Badge>);
    badge = screen.getByText("Success");
    expect(badge).toHaveClass("bg-success-bg", "text-success");

    rerender(<Badge variant="warning">Warning</Badge>);
    badge = screen.getByText("Warning");
    expect(badge).toHaveClass("bg-warning-bg", "text-warning");

    rerender(<Badge variant="error">Error</Badge>);
    badge = screen.getByText("Error");
    expect(badge).toHaveClass("bg-error-bg", "text-error");
  });

  it("applies custom inline color correctly", () => {
    render(<Badge color="#ff00ff">Custom Color</Badge>);
    const badge = screen.getByText("Custom Color");
    expect(badge).toHaveStyle({
      backgroundColor: "#ff00ff20",
      color: "#ff00ff",
    });
    expect(badge).not.toHaveClass("bg-elevated");
  });

  it("applies custom className", () => {
    render(<Badge className="my-custom-badge-class">Custom Class</Badge>);
    const badge = screen.getByText("Custom Class");
    expect(badge).toHaveClass("my-custom-badge-class");
  });
});

describe("StatusDot", () => {
  it("renders correctly with label", () => {
    render(<StatusDot label="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies correct variant classes to the dot and text", () => {
    const { container, rerender } = render(<StatusDot variant="success" label="Active" />);
    let dot = container.querySelector(".rounded-full");
    let text = screen.getByText("Active");
    
    expect(dot).toHaveClass("bg-success");
    expect(text).toHaveClass("text-success");

    rerender(<StatusDot variant="error" label="Failed" />);
    dot = container.querySelector(".rounded-full");
    text = screen.getByText("Failed");

    expect(dot).toHaveClass("bg-error");
    expect(text).toHaveClass("text-error");
  });

  it("applies custom className", () => {
    const { container } = render(<StatusDot className="my-status-dot" label="Test" />);
    expect(container.firstChild).toHaveClass("my-status-dot");
  });
});
