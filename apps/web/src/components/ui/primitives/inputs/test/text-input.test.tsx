import { render, screen, fireEvent } from "@testing-library/react";
import { TextInput } from "../text-input";

describe("TextInput", () => {
  it("renders a standard text input by default", () => {
    const handleChange = jest.fn();
    render(<TextInput value="initial" onChange={handleChange} placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveValue("initial");
  });

  it("renders a textarea when multiline is true", () => {
    const handleChange = jest.fn();
    render(<TextInput value="multiline content" onChange={handleChange} multiline rows={5} placeholder="Enter desc" />);

    const textarea = screen.getByPlaceholderText("Enter desc");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveValue("multiline content");
    expect(textarea).toHaveAttribute("rows", "5");
  });

  it("calls onChange callback when text is entered", () => {
    const handleChange = jest.fn();
    render(<TextInput value="" onChange={handleChange} placeholder="Input" />);

    const input = screen.getByPlaceholderText("Input");
    fireEvent.change(input, { target: { value: "hello" } });
    expect(handleChange).toHaveBeenCalledWith("hello");
  });

  it("displays error message and applies error styles", () => {
    render(<TextInput value="" onChange={jest.fn()} placeholder="Input" error="This field is required" />);

    expect(screen.getByText("This field is required")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Input");
    expect(input).toHaveClass("!border-error");
  });

  it("displays hint message when error is not present", () => {
    const { rerender } = render(<TextInput value="" onChange={jest.fn()} placeholder="Input" hint="Min 8 characters" />);
    expect(screen.getByText("Min 8 characters")).toBeInTheDocument();

    rerender(<TextInput value="" onChange={jest.fn()} placeholder="Input" error="Error message" hint="Min 8 characters" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.queryByText("Min 8 characters")).not.toBeInTheDocument();
  });

  it("applies small size styling class", () => {
    render(<TextInput value="" onChange={jest.fn()} placeholder="Input" size="sm" />);
    const input = screen.getByPlaceholderText("Input");
    expect(input).toHaveClass("field-input", "!py-1", "!text-xs");
  });

  it("respects the disabled attribute", () => {
    render(<TextInput value="" onChange={jest.fn()} placeholder="Input" disabled />);
    const input = screen.getByPlaceholderText("Input");
    expect(input).toBeDisabled();
  });
});
