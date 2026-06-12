export function RowPreviewIcon({ columns }: { columns: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex gap-0.5 w-6 shrink-0">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1 h-3.5 rounded-sm bg-current opacity-30" />
      ))}
    </div>
  );
}
