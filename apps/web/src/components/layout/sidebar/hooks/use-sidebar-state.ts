import { useEffect, useState } from "react";

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed-sections");
    if (saved) setCollapsedSections(new Set<string>(JSON.parse(saved) as string[]));
  }, []);

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
