"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Badge } from "@/components/ui/primitives/display/badge";
import { Button } from "@/components/ui/primitives/actions/button";
import { useAppContext } from "@/context/app-context";
import { useUIContext } from "@/context/ui-context";
import { useEscape } from "@/hooks/useEscape";
import { Check, ChevronDown, Globe, Settings, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SpaceSwitcherProps {
  collapsed?: boolean;
}

export function SpaceSwitcher({ collapsed = false }: SpaceSwitcherProps) {
  const t = useTranslations("SpaceSwitcher");
  const { space, spaces, setSpace } = useAppContext();
  const { openSettings } = useUIContext();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function handleClose() {
    setIsOpen(false);
  }

  useEscape(
    useCallback(() => {
      if (isOpen) handleClose();
    }, [isOpen]),
  );

  function handleSelectSpace(spaceItem: (typeof spaces)[0]) {
    setSpace(spaceItem);
    handleClose();
    router.push("/");
  }

  if (!space) return null;

  return (
    <>
      {collapsed ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface hover:bg-elevated transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas"
          title={space.name}
        >
          <span className="shrink-0 flex items-center text-ink-secondary">
            {space.icon ? <IconDisplay value={space.icon} size={16} /> : <Globe size={16} />}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center w-full px-2 py-2 rounded-lg bg-surface hover:bg-elevated transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas"
        >
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="shrink-0 flex items-center text-ink-secondary">
              {space.icon ? <IconDisplay value={space.icon} size={16} /> : <Globe size={16} />}
            </span>
            <span className="text-sm text-ink truncate">{space.name}</span>
          </span>
          <ChevronDown size={14} className="text-ink-muted shrink-0 ml-auto" />
        </button>
      )}

      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50" onClick={handleClose}>
            <div
              className="w-96 bg-elevated border border-stroke rounded-2xl overflow-hidden shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="type-nav-label">{t("spaces")}</span>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X size={14} />
                </Button>
              </div>
              <div className="px-2 pb-2 flex flex-col gap-0.5">
                {spaces.map((spaceItem) => (
                  <button
                    key={spaceItem.id}
                    type="button"
                    onClick={() => handleSelectSpace(spaceItem)}
                    className={`flex items-center gap-3 w-full px-2.5 py-2.5 rounded-lg transition-colors duration-150 cursor-pointer ${
                      spaceItem.id === space.id ? "bg-surface text-ink" : "text-ink-secondary hover:bg-surface hover:text-ink"
                    }`}
                  >
                    <span className="shrink-0 flex items-center text-ink-secondary">
                      {spaceItem.icon ? <IconDisplay value={spaceItem.icon} size={16} /> : <Globe size={16} />}
                    </span>
                    <span className="text-sm truncate flex-1 text-left">{spaceItem.name}</span>
                    {spaceItem.isDefault && (
                      <Badge variant="accent" className="shrink-0 px-1.5 text-xs">
                        {t("default")}
                      </Badge>
                    )}
                    {spaceItem.id === space.id && <Check size={14} className="text-accent shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-stroke px-2 py-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    openSettings("space");
                  }}
                  className="flex items-center justify-center gap-2 w-full px-2.5 py-2 rounded-lg text-sm text-ink-secondary hover:bg-surface hover:text-ink transition-colors duration-150 cursor-pointer"
                >
                  <Settings size={14} />
                  <span>{t("manageSpaces")}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
