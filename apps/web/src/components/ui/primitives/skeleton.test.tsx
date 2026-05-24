import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/primitives/skeleton";

describe("Skeleton", () => {
  it("renders a div element", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies default classes", () => {
    const { container } = render(<Skeleton />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass("animate-pulse");
    expect(div).toHaveClass("bg-stroke/50");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass("custom-class");
    expect(div).toHaveClass("animate-pulse");
  });
});
