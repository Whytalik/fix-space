"use client";

import { LogoIcon } from "@/components/ui/brand/logo-icon";
import Link from "next/link";
import { HeaderActions } from "./header-actions";
import { HeaderDatabase } from "./header-database";
import { HeaderSpace } from "./header-space";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stroke bg-[rgba(15,15,17,0.85)] backdrop-blur-md">
      <div className="flex items-center justify-between px-6 h-15">
        <div className="flex items-center gap-2.25">
          <Link href="/" className="flex items-center gap-2.25 cursor-pointer">
            <LogoIcon size={28} />
            <span className="font-extrabold text-base tracking-[-0.04em] text-ink">Nucleus</span>
          </Link>
          <HeaderSpace />
          <HeaderDatabase />
        </div>
        <HeaderActions />
      </div>
    </header>
  );
}
