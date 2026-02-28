"use client";

import { HeaderActions } from "./header-actions";
import { HeaderSpace } from "./header-space";
import { LogoIcon } from "@nucleus/ui";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stroke bg-[rgba(15,15,17,0.85)] backdrop-blur-md">
      <div className="flex items-center justify-between px-6 h-15">
        <div className="flex items-center gap-2.25">
          <Link href="/" className="flex items-center gap-2.25">
            <LogoIcon size={28} />
            <span className="font-extrabold text-base tracking-[-0.04em] text-ink">Nucleus</span>
          </Link>
          <HeaderSpace />
        </div>
        <HeaderActions />
      </div>
    </header>
  );
}
