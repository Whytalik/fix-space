import type { DatabaseResponseDto } from "@nucleus/domain";

export function DatabaseItem({ db }: { db: DatabaseResponseDto }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-surface cursor-pointer group">
      <span className="text-sm shrink-0">{db.icon ?? "📄"}</span>
      <span className="text-[13px] text-ink-secondary group-hover:text-ink truncate">{db.title || db.name}</span>
    </div>
  );
}
