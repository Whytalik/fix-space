import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/primitives/actions/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      {Icon && <Icon size={32} className="text-ink-muted" />}
      <p className="text-sm font-medium text-ink-secondary">{title}</p>
      {description && <p className="type-hint max-w-xs">{description}</p>}
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
