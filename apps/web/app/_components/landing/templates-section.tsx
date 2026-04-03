import { ClipboardList, FilePlus, Sparkles } from "lucide-react";

const TEMPLATES = [
  { icon: ClipboardList, name: "Post-Trade Analysis" },
  { icon: FilePlus, name: "New Setup Idea" },
  { icon: Sparkles, name: "Weekly Review" },
];

export function TemplatesSection() {
  return (
    <section id="templates" className="scroll-mt-24 py-20 px-6 bg-surface border-y border-stroke">
      <div className="max-w-270 mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-2">Templates</p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-[-0.04em] text-ink">
            Never start from a blank page
          </h2>
          <p className="mt-4 text-sm text-ink-secondary max-w-120 mx-auto md:mx-0 leading-relaxed">
            FIX Space ships with pre-built templates for trade logs, session reviews, and strategy documents. When
            creating a new record, a template is applied automatically — you get a ready-made page structure and can
            start filling it immediately. Build your own templates to match your personal workflow.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div className="bg-elevated border border-stroke-subtle rounded-xl p-6 w-full max-w-sm">
            <p className="text-sm font-semibold text-ink mb-4">New record from template</p>
            <div className="flex flex-col gap-3">
              {TEMPLATES.map(({ icon: Icon, name }) => (
                <div
                  key={name}
                  className="flex items-center gap-3 bg-surface border border-stroke rounded-lg px-4 py-3 cursor-pointer hover:border-accent transition-colors"
                >
                  <Icon size={16} className="text-ink-muted" />
                  <span className="text-sm font-medium text-ink">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
