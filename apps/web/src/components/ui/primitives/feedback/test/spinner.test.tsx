import { render, screen } from "@testing-library/react";
import { Spinner } from "../spinner";

describe("Spinner", () => {
  it("renders correctly with default props", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status", { name: "Loading" });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("rounded-full", "animate-spin", "w-5", "h-5", "border-stroke", "border-t-accent");
  });

  it("applies correct size classes", () => {
    const { rerender } = render(<Spinner size="sm" />);
    let spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("w-4", "h-4");

    rerender(<Spinner size="lg" />);
    spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("w-6", "h-6");
  });

  it("applies correct color classes", () => {
    render(<Spinner color="white" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("border-white/30", "border-t-white");
    expect(spinner).not.toHaveClass("border-stroke");
  });

  it("applies custom className", () => {
    render(<Spinner className="my-custom-spinner" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("my-custom-spinner");
  });
});
