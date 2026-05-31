import { render, screen, fireEvent } from "@testing-library/react";
import { Toggle } from "../toggle";

describe("Toggle", () => {
  it("renders correctly with default off state", () => {
    const handleChange = jest.fn();
    render(<Toggle value={false} onChange={handleChange} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-stroke");
    expect(button.querySelector("span")).not.toHaveClass("translate-x-4");
  });

  it("renders correctly with default on state", () => {
    const handleChange = jest.fn();
    render(<Toggle value={true} onChange={handleChange} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-accent");
    expect(button.querySelector("span")).toHaveClass("translate-x-4");
  });

  it("calls onChange callback with toggled value on click", () => {
    const handleChange = jest.fn();
    const { rerender } = render(<Toggle value={false} onChange={handleChange} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleChange).toHaveBeenCalledWith(true);

    rerender(<Toggle value={true} onChange={handleChange} />);
    fireEvent.click(button);
    expect(handleChange).toHaveBeenCalledWith(false);
  });
});
