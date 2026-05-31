import { render } from "@testing-library/react";
import { Skeleton } from "../skeleton";

describe("Skeleton", () => {
  it("renders correctly", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies default classes and inline style for shimmer effect", () => {
    const { container } = render(<Skeleton />);
    const div = container.firstChild as HTMLElement;

    expect(div).toHaveClass("rounded-md", "bg-[length:200%_100%]", "animate-shimmer");
    expect(div).toHaveStyle({
      backgroundSize: "200% 100%",
    });
  });

  it("applies custom className correctly", () => {
    const { container } = render(<Skeleton className="w-12 h-12 rounded-full" />);
    const div = container.firstChild as HTMLElement;

    expect(div).toHaveClass("w-12", "h-12", "rounded-full");
    expect(div).toHaveClass("animate-shimmer");
  });
});
