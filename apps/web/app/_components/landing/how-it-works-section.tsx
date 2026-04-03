import type { LucideIcon } from "lucide-react";
import { BarChart3, TrendingUp, Upload } from "lucide-react";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    icon: Upload,
    title: "Capture your trading activity",
    description:
      "Record trades manually or import history from MT4, MT5, Binance, or Bybit. Fill in session properties, apply a template, and add free-form content to each record.",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Analyze and find patterns",
    description:
      "Filter and sort your journal by any property. Use formula fields for P&L, win rate, and risk metrics. Identify which setups, sessions, and conditions produce results.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Build systematic habits",
    description:
      "Follow pre-session and post-session routines. Log mistakes and behavioral errors. Systematize your strategies in the Trading System database and track their evolution.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="workflow" className="scroll-mt-15 py-20 px-6">
      <div className="max-w-270 mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-2">Workflow</p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-[-0.04em] text-ink">How it works</h2>
          <p className="mt-3 text-sm text-ink-secondary max-w-110 mx-auto leading-relaxed">
            From raw trade data to structured habits and measurable improvement — in three steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-bold text-ink-muted tabular-nums">{number}</span>
                <div className="w-px h-4 bg-stroke" />
                <Icon size={17} className="text-accent" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">{title}</h3>
                <p className="mt-2 text-sm text-ink-secondary leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
