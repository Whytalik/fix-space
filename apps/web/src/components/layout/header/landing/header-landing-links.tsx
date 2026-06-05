"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#focus", label: "Focus" },
  { href: "#workspace", label: "Workspace" },
  { href: "#templates", label: "Templates" },
  { href: "#workflow", label: "Workflow" },
  { href: "#import", label: "Import" },
];

function scrollToSection(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HeaderLandingLinks() {
  const [activeLink, setActiveLink] = useState("");

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
      const el = document.querySelector(href);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden md:flex items-center gap-6">
      {LINKS.map(({ href, label }) => (
        <button
          key={href}
          type="button"
          onClick={() => scrollToSection(href)}
          className={`text-[13.5px] font-semibold transition-colors cursor-pointer ${
            activeLink === href ? "text-accent" : "text-ink-secondary hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
