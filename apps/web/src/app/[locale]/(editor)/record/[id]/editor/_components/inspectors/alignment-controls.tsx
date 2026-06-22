import { useTranslations } from "next-intl";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { Section } from "./section";

interface AlignmentControlsProps {
  value?: string;
  onChange: (patch: Record<string, unknown>) => void;
}

export function AlignmentControls({ value, onChange }: AlignmentControlsProps) {
  const t = useTranslations("RecordPage.inspector");
  return (
    <Section label={t("alignment")}>
      <div className="flex gap-1">
        {[
          { id: "left", icon: <AlignLeft size={14} /> },
          { id: "center", icon: <AlignCenter size={14} /> },
          { id: "right", icon: <AlignRight size={14} /> },
          { id: "justify", icon: <AlignJustify size={14} /> },
        ].map(({ id, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange({ align: id })}
            className={`flex-1 py-2 flex items-center justify-center rounded-lg border transition-colors duration-150 ${
              (value || "left") === id ? "border-accent bg-accent/10 text-accent" : "border-stroke text-ink-muted hover:text-ink"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
    </Section>
  );
}
