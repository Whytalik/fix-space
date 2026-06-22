interface ChartPlaceholderProps {
  title?: string;
  message: string;
}

export function ChartPlaceholder({ title, message }: ChartPlaceholderProps) {
  return (
    <div className="py-8 border border-dashed border-stroke rounded-2xl flex flex-col items-center justify-center gap-2 text-ink-muted">
      {title && <p className="text-xs font-semibold text-ink-secondary">{title}</p>}
      <p className="text-xs">{message}</p>
    </div>
  );
}
