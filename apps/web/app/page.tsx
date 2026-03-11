"use client";

import { Sidebar } from "@/components/navigation/sidebar/sidebar";
import { LogoIcon } from "@/components/ui/brand/logo-icon";
import { useAppContext } from "@/context/app-context";

export default function Home() {
  const { user, isLoading } = useAppContext();

  if (isLoading) return null;

  if (user) {
    return (
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <h1 className="type-page-title">Welcome back, {user.username}!</h1>
        </main>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 gap-5 px-6 text-center">
      <LogoIcon size={72} />

      <h1 className="text-[clamp(40px,6vw,72px)] font-extrabold tracking-[-0.05em] text-ink leading-none">Nucleus</h1>

      <p className="text-base leading-relaxed text-ink-secondary max-w-90">
        A platform for collecting and working with data during the trading process. Track deals, routine, mistakes, and
        performance.
      </p>

      <div className="mt-3 px-5 py-2.5 rounded-full border border-stroke bg-surface text-[13px] font-semibold text-ink-secondary tracking-[0.02em]">
        In development
      </div>
    </main>
  );
}
