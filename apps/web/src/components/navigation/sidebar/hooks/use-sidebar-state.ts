"use client";

import { useState } from "react";

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("sidebar-collapsed-sections");
      return saved ? new Set<string>(JSON.parse(saved) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  function toggleSection(sectionId: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      localStorage.setItem("sidebar-collapsed-sections", JSON.stringify([...next]));
      return next;
    });
  }

  return { collapsed, toggle, collapsedSections, toggleSection };
}
