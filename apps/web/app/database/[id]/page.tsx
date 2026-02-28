"use client";

import { Sidebar } from "@/components/home/sidebar/sidebar";
import { useAppContext } from "@/context/app-context";
import { SectionResponseDto } from "@nucleus/domain";
import { useParams } from "next/navigation";

export default function DatabasePage() {
  const { id } = useParams<{ id: string }>();
  const { space } = useAppContext();

  const allDatabases = [
    ...(space?.databases ?? []),
    ...(space?.sections ?? []).flatMap((s: SectionResponseDto) => s.databases ?? []),
  ];

  const db = allDatabases.find((d) => d.id === id);

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="mb-8">

        </div>
      </main>
    </div>
  );
}
