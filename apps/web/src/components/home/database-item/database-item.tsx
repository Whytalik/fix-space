"use client";

import type { DatabaseResponseDto } from "@nucleus/domain";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DatabaseItem({ db }: { db: DatabaseResponseDto }) {
  const pathname = usePathname();
  const isActive = pathname === `/database/${db.id}`;

  return (
    <Link
      href={`/database/${db.id}`}
      className={`flex items-center gap-2 px-2 py-1 rounded-md group transition-colors ${
        isActive ? "bg-surface text-ink" : "hover:bg-surface"
      }`}
    >
      <span className="text-sm shrink-0">{db.icon ?? "📄"}</span>
      <span className={`text-[13px] truncate transition-colors ${isActive ? "text-ink" : "text-ink-secondary group-hover:text-ink"}`}>
        {db.title || db.name}
      </span>
    </Link>
  );
}
