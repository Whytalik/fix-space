import { Card } from "@/components/ui/primitives/display/card";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthPageShellProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkHref: string;
  footerLinkText: string;
  onFooterLinkClick?: () => void;
  children: ReactNode;
}

export function AuthPageShell({
  title,
  subtitle,
  footerText,
  footerLinkHref,
  footerLinkText,
  onFooterLinkClick,
  children,
}: AuthPageShellProps) {
  return (
    <div className="flex items-center justify-center flex-1 p-4">
      <div className="w-full max-w-100">
        <div className="mb-5 text-center">
          <h1 className="type-page-title">{title}</h1>
          <p className="text-sm text-ink-secondary mt-1.5">{subtitle}</p>
        </div>

        <Card>{children}</Card>

        <p className="text-center mt-5 text-sm text-ink-secondary">
          {footerText}{" "}
          {onFooterLinkClick ? (
            <button type="button" onClick={onFooterLinkClick} className="font-semibold text-accent cursor-pointer">
              {footerLinkText}
            </button>
          ) : (
            <Link href={footerLinkHref} className="font-semibold text-accent">
              {footerLinkText}
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}
