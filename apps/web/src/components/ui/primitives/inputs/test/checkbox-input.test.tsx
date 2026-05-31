import { render, screen, fireEvent } from "@testing-library/react";
import { CheckboxInput } from "../checkbox-input";

describe("CheckboxInput", () => {
  it("renders correctly in unchecked state", () => {
    const handleChange = jest.fn();
    render(<CheckboxInput checked={false} onChange={handleChange} label="Accept Terms" />);

    const checkbox = screen.getByRole("checkbox", { name: "Accept Terms" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    
    const checkIcon = checkbox.querySelector("svg");
    expect(checkIcon).not.toBeInTheDocument();
  });

  it("renders correctly in checked state", () => {
    const handleChange = jest.fn();
    render(<CheckboxInput checked={true} onChange={handleChange} label="Accept Terms" />);

    const checkbox = screen.getByRole("checkbox", { name: "Accept Terms" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("aria-checked", "true");

    const checkIcon = checkbox.querySelector("svg");
    expect(checkIcon).toBeInTheDocument();
  });

  it("calls onChange callback with toggled value on click", () => {
    const handleChange = jest.fn();
    const { rerender } = render(<CheckboxInput checked={false} onChange={handleChange} label="Toggle me" />);

    const checkbox = screen.getByRole("checkbox", { name: "Toggle me" });
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);

    rerender(<CheckboxInput checked={true} onChange={handleChange} label="Toggle me" />);
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(false);
  });
});
