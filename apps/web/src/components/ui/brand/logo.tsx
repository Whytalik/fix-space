import Link from "next/link";
import { LogoIcon } from "./logo-icon";

export { LogoIcon };

interface LogoProps {
  size?: number;
  href?: string;
  className?: string;
}

export function Logo({ size = 28, href, className }: LogoProps) {
  const content = (
    <>
      <LogoIcon size={size} />
      <span
        className="font-extrabold tracking-[-0.04em] leading-none text-ink"
        style={{ fontSize: Math.round(size * 0.57) }}
      >
        FIX Space
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`flex items-center gap-2.25 cursor-pointer ${className ?? ""}`}>
        {content}
      </Link>
    );
  }

  return <div className={`flex items-center gap-2 ${className ?? ""}`}>{content}</div>;
}
