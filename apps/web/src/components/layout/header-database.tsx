"use client";

import { useAppContext } from "@/context/app-context";
import { useParams, usePathname } from "next/navigation";

export function HeaderDatabase() {
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const { space } = useAppContext();

  if (!pathname.startsWith("/database/")) return null;

  const allDatabases = [
    ...(space?.databases ?? []),
    ...(space?.sections ?? []).flatMap((s) => s.databases ?? []),
  ];

  const db = allDatabases.find((d) => d.id === params.id);
  if (!db) return null;

  return (
    <>
      <span className="text-stroke mx-1">|</span>
      <span className="text-sm font-semibold text-ink-secondary">
        {db.icon ? <span className="mr-1">{db.icon}</span> : "📄"}
        {db.title || db.name}
      </span>
    </>
  );
}
