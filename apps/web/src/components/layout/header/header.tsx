"use client";

import { SpaceSwitcher } from "@/components/navigation/switcher/space-switcher";
import { Logo } from "@/components/ui/brand/logo";
import { HeaderActions } from "./header-actions";
import { HeaderDatabase } from "./header-database";
import { LanguageSwitcher } from "./language-switcher";
import { LandingNav } from "./landing-nav";

export function Header({ hideNav = false }: { hideNav?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-stroke bg-[rgba(15,15,17,0.85)] backdrop-blur-md">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 h-15">
        <div className="flex items-center gap-2.25">
          <Logo size={28} href="/" />
          <SpaceSwitcher />
          <HeaderDatabase />
        </div>

        <div className="flex justify-center min-w-0">{!hideNav && <LandingNav />}</div>

        <div className="flex items-center justify-end gap-2">
          <LanguageSwitcher />
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
