import { render, screen } from "@testing-library/react";
import { Card } from "../card";

describe("Card", () => {
  it("renders correctly with default flat variant", () => {
    render(<Card>Card Content</Card>);
    const card = screen.getByText("Card Content");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("card", "p-5");
  });

  it("renders with elevated variant", () => {
    render(<Card variant="elevated">Elevated Content</Card>);
    const card = screen.getByText("Elevated Content");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("card-elevated", "p-5");
  });

  it("applies custom inline style", () => {
    render(<Card style={{ backgroundColor: "red", marginTop: "10px" }}>Styled Content</Card>);
    const card = screen.getByText("Styled Content");
    expect(card).toHaveStyle({
      backgroundColor: "red",
      marginTop: "10px",
    });
  });

  it("applies custom className", () => {
    render(<Card className="my-custom-card-class">Class Content</Card>);
    const card = screen.getByText("Class Content");
    expect(card).toHaveClass("my-custom-card-class");
  });
});
