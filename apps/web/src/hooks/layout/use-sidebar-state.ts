import { useEffect, useRef, useState } from "react";

export function useSidebarState(initialCollapsed = false, initialExpandedSections: string[] = []) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(initialExpandedSections));
  const [isMounted, setIsMounted] = useState(false);

  const initialCollapsedRef = useRef(initialCollapsed);
  const initialExpandedSectionsRef = useRef(initialExpandedSections);

  useEffect(() => {
    setIsMounted(true);
    const savedCollapsed = localStorage.getItem("sidebar-collapsed");
    if (savedCollapsed !== null) {
      const isSavedCollapsed = savedCollapsed === "true";
      if (isSavedCollapsed !== initialCollapsedRef.current) {
        setCollapsed(isSavedCollapsed);
      }
    }

    const savedSections = localStorage.getItem("sidebar-expanded-sections");
    if (savedSections) {
      try {
        const parsed = JSON.parse(savedSections) as string[];
        const sortedParsed = [...parsed].sort();
        const sortedInitial = [...initialExpandedSectionsRef.current].sort();
        if (JSON.stringify(sortedParsed) !== JSON.stringify(sortedInitial)) {
          setExpandedSections(new Set(parsed));
        }
      } catch (e) {
        console.error("Failed to parse sidebar-expanded-sections from localStorage", e);
      }
    }
  }, []);

  function setCookie(name: string, value: string) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
  }

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      setCookie("sidebar-collapsed", String(next));
      return next;
    });
  }

  function toggleSection(sectionId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      const array = [...next];
      localStorage.setItem("sidebar-expanded-sections", JSON.stringify(array));
      setCookie("sidebar-expanded-sections", JSON.stringify(array));
      return next;
    });
  }

  return {
    collapsed,
    toggle,
    expandedSections,
    toggleSection,
    isMounted,
  };
}
