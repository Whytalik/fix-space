import { render, screen } from "@testing-library/react";
import { Avatar } from "../avatar";

jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  },
}));

describe("Avatar", () => {
  it("renders correctly with initials when no image is provided", () => {
    render(<Avatar initial="vs" size="md" />);
    const avatar = screen.getByText("VS");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass("bg-accent-muted", "text-accent", "w-14", "h-14");
  });

  it("renders standard image when image source is provided", () => {
    render(<Avatar initial="vs" image="/path/to/avatar.jpg" size="lg" />);
    const img = screen.getByRole("img", { name: "vs" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/path/to/avatar.jpg");
    expect(img).toHaveClass("w-20", "h-20", "object-cover");
  });

  it("applies correct class names for small size", () => {
    render(<Avatar initial="vs" size="sm" />);
    const avatar = screen.getByText("VS");
    expect(avatar).toHaveClass("w-7.5", "h-7.5", "text-xs");
  });

  it("applies custom className correctly", () => {
    render(<Avatar initial="vs" className="custom-avatar-class" />);
    const avatar = screen.getByText("VS");
    expect(avatar).toHaveClass("custom-avatar-class");
  });
});
