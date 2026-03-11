"use client";

import { SpaceSwitcher } from "@/components/navigation/switcher/space-switcher";
import { Logo } from "@/components/ui/brand/logo";
import { HeaderActions } from "./header-actions";
import { HeaderDatabase } from "./header-database";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stroke bg-[rgba(15,15,17,0.85)] backdrop-blur-md">
      <div className="flex items-center justify-between px-6 h-15">
        <div className="flex items-center gap-2.25">
          <Logo size={28} href="/" />
          <SpaceSwitcher />
          <HeaderDatabase />
        </div>
        <HeaderActions />
      </div>
    </header>
  );
}
