"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#problem", key: "problem" },
  { href: "#solution", key: "solution" },
  { href: "#features", key: "features" },
  { href: "#templates", key: "templates" },
  { href: "#workflow", key: "workflow" },
] as const;

function scrollToSection(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HeaderLandingLinks() {
  const [activeLink, setActiveLink] = useState("");
  const t = useTranslations("LandingNav");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveLink(`#${entry.target.id}`);
        });
      },
      { root: null, rootMargin: "-60px 0px -40% 0px", threshold: 0 },
    );

    LINKS.forEach(({ href }) => {
      const element = document.querySelector(href);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden md:flex items-center gap-6">
      {LINKS.map(({ href, key }) => (
        <button
          key={href}
          type="button"
          onClick={() => scrollToSection(href)}
          className={`text-sm font-semibold transition-colors duration-150 cursor-pointer ${
            activeLink === href ? "text-accent" : "text-ink-secondary hover:text-ink"
          }`}
        >
          {t(key)}
        </button>
      ))}
    </nav>
  );
}
