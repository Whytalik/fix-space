"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";

interface SidebarTrashProps {
  collapsed: boolean;
  count?: number;
}

export function SidebarTrash({ collapsed, count = 0 }: SidebarTrashProps) {
  if (count === 0) return null;

  if (collapsed) {
    return (
      <div title={`Кошик (${count})`} className="flex justify-center">
        <Link
          href="/trash"
          className="relative flex items-center justify-center py-1 px-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors duration-150"
        >
          <Trash2 size={14} />
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-accent text-white text-[9px] font-semibold leading-3.5 flex items-center justify-center">
            {count > 99 ? "99+" : count}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/trash"
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-surface transition-colors duration-150 w-full"
    >
      <Trash2 size={14} className="shrink-0" />
      <span className="truncate">
        Кошик <span className="text-ink-muted/70">({count})</span>
      </span>
    </Link>
  );
}
