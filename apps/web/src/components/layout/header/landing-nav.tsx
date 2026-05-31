"use client";

import { useAppContext } from "@/context/app-context";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AUTH_PAGES = ["/login", "/register"];

export function LandingNav() {
  const { user } = useAppContext();
  const pathname = usePathname();
  const t = useTranslations("LandingNav");
  const [activeSection, setActiveSection] = useState("");

  const isAuthPage = AUTH_PAGES.some((page) => pathname.endsWith(page));

  const links = [
    { id: "problem", label: t("problem") },
    { id: "data-types", label: t("dataTypes") },
    { id: "market-analysis", label: t("market") },
    { id: "solution", label: t("solution") },
    { id: "features", label: t("features") },
    { id: "templates", label: t("templates") },
    { id: "workflow", label: t("workflow") },
    { id: "import", label: t("import") },
  ];

  useEffect(() => {
    if (isAuthPage) return;

    const observerOptions = {
      root: null,
      // Target a thin line at 30% from the top for precise switching
      rootMargin: "-30% 0px -69% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    const allSectionIds = [
      "hero",
      "problem",
      "data-types",
      "market-analysis",
      "solution",
      "features",
      "templates",
      "workflow",
      "import",
    ];
    allSectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isAuthPage]);

  if (user || isAuthPage) return null;

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // scrollIntoView works perfectly with custom scroll containers
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Clear hash from URL immediately without jump
      window.history.pushState(null, "", window.location.pathname);
    }
  };

  return (
    <nav className="hidden lg:flex items-center gap-0.5">
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          onClick={(e) => handleScroll(e, link.id)}
          className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-300 relative group cursor-pointer ${
            activeSection === link.id ? "text-accent" : "text-ink-secondary hover:text-ink"
          }`}
        >
          {link.label}
          <div
            className={`absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full transition-all duration-300 ${
              activeSection === link.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            }`}
          />
        </a>
      ))}
    </nav>
  );
}
