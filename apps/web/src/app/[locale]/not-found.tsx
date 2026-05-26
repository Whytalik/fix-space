import { LogoIcon } from "@/components/ui/brand/logo";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <LogoIcon size={40} />
      </div>

      <div className="animate-fade-up flex flex-col gap-2" style={{ animationDelay: "0.18s" }}>
        <h1 className="text-[clamp(28px,5vw,42px)] font-extrabold tracking-[-0.04em] text-ink leading-none">
          {t("title")}
        </h1>
        <p className="text-sm text-ink-secondary max-w-72 leading-relaxed">{t("description")}</p>
      </div>

      <div className="animate-fade-up flex items-center gap-3 w-full max-w-50" style={{ animationDelay: "0.30s" }}>
        <div className="flex-1 h-px bg-stroke" />
        <span className="text-xs font-semibold tracking-widest text-ink-muted uppercase">404</span>
        <div className="flex-1 h-px bg-stroke" />
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "0.42s" }}>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold transition-colors duration-150 hover:bg-accent-hover"
        >
          {t("goToWorkspace")}
        </Link>
      </div>
    </div>
  );
}
