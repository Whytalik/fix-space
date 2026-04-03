import { Card } from "@/components/ui/primitives/card";
import type { LucideIcon } from "lucide-react";
import { Activity, AlertTriangle, BookOpen, CalendarClock, FileText, GitBranch, Wallet } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    title: "Trading Journal",
    description:
      "Log every trade with full context — instrument, direction, entry/exit, lot size, P&L, R:R, setup, and post-trade notes. Filter and sort by any property.",
  },
  {
    icon: CalendarClock,
    title: "Daily Routine",
    description:
      "Structure your pre-session preparation and post-session review with checklists. Build consistent habits that compound over time.",
  },
  {
    icon: FileText,
    title: "Notes",
    description:
      "Capture market observations, ideas, and research in categorized, searchable records with rich content blocks.",
  },
  {
    icon: AlertTriangle,
    title: "Mistakes Log",
    description:
      "Track recurring behavioral errors and discipline breaks. Identify patterns in your psychology before they cost you more.",
  },
  {
    icon: Wallet,
    title: "Accounts",
    description:
      "Monitor balances, drawdown, and leverage across multiple broker accounts. Keep a complete picture of your capital in one place.",
  },
  {
    icon: Activity,
    title: "Operations",
    description:
      "Record deposits, withdrawals, fees, and adjustments. Full financial history tied to your trading activity.",
  },
  {
    icon: GitBranch,
    title: "Trading System",
    description:
      "Document your strategy rules, entry criteria, and risk parameters. Version and evaluate your systems as they evolve.",
  },
];

export function FeaturesSection() {
  return (
    <section id="workspace" className="scroll-mt-15 py-20 px-6">
      <div className="max-w-270 mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-2">Workspace</p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-[-0.04em] text-ink">
            Everything a CFD trader needs
          </h2>
          <p className="mt-3 text-sm text-ink-secondary max-w-120 mx-auto leading-relaxed">
            Seven databases with trade-aware properties, formula fields, and default templates — created automatically
            when you register. No blank canvas, no setup.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {FEATURES.map(({ icon: Icon, title, description }, index) => (
            <Card
              key={title}
              className={`group flex flex-col gap-4 hover:border-ink-muted transition-colors duration-150 ${
                index < 4 ? "lg:col-span-3" : "lg:col-span-4"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                <Icon size={17} className="text-ink-secondary group-hover:text-accent transition-colors duration-150" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">{title}</h3>
                <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">{description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
