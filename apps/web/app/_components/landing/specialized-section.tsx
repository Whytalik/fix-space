import { LogoIcon } from "@/components/ui/brand/logo-icon";
import { CheckCircle } from "lucide-react";

export function SpecializedSection() {
  return (
    <section id="focus" className="scroll-mt-15 py-20 px-6">
      <div className="max-w-270 mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-2">Focus</p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-[-0.04em] text-ink">
            Built for traders, not for everyone
          </h2>
          <p className="mt-4 text-sm text-ink-secondary max-w-140 mx-auto leading-relaxed">
            Generic tools give you flexibility but no domain knowledge. Specialized journals know trading but lock you
            into a rigid structure. FIX Space is the first tool that offers both — a purpose-built trading workspace you
            can adapt to your own style.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {/* Generic tools */}
          <div className="bg-surface border border-stroke rounded-xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">📄</span>
              <div>
                <p className="text-sm font-bold text-ink">Notion / Google Sheets</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Generic tools</p>
              </div>
            </div>
            <ul className="flex flex-col gap-3 text-xs">
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">❌</span>
                <span>No trading model — build databases, properties, and formulas from scratch.</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">❌</span>
                <span>No native concepts of P&amp;L, risk, setups, or session structure.</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">❌</span>
                <span>No broker import — every trade entered manually.</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">✅</span>
                <span>Fully flexible structure, free to use.</span>
              </li>
            </ul>
          </div>

          {/* Specialized journals */}
          <div className="bg-surface border border-stroke rounded-xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">📊</span>
              <div>
                <p className="text-sm font-bold text-ink">Specialized Journals</p>
                <p className="text-[11px] text-ink-muted mt-0.5">e.g. TraderSync, Edgewonk</p>
              </div>
            </div>
            <ul className="flex flex-col gap-3 text-xs">
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">✅</span>
                <span>Ready data model and analytics oriented around trading.</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">✅</span>
                <span>Auto-import from brokers, built-in statistics and charts.</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">❌</span>
                <span>Fixed structure — can&apos;t adapt the system to your workflow.</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">❌</span>
                <span>Paid only, starting from $30/month. No free tier.</span>
              </li>
            </ul>
          </div>

          {/* FIX Space */}
          <div className="bg-surface border border-accent rounded-xl p-7 ring-4 ring-accent-muted">
            <div className="flex items-center gap-3 mb-5">
              <LogoIcon size={22} />
              <div>
                <p className="text-sm font-bold text-ink">FIX Space</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Purpose-built &amp; flexible</p>
              </div>
            </div>
            <ul className="flex flex-col gap-3 text-xs">
              <li className="flex items-start gap-2 text-ink">
                <CheckCircle size={13} className="text-success shrink-0 mt-0.5" />
                <span>
                  Seven pre-configured databases — journal, routines, strategies, and more — ready on day one.
                </span>
              </li>
              <li className="flex items-start gap-2 text-ink">
                <CheckCircle size={13} className="text-success shrink-0 mt-0.5" />
                <span>Trade-aware properties with formula fields, filters, sorting, and custom templates.</span>
              </li>
              <li className="flex items-start gap-2 text-ink">
                <CheckCircle size={13} className="text-success shrink-0 mt-0.5" />
                <span>Import from MT4, MT5, Binance, Bybit — no manual entry needed.</span>
              </li>
              <li className="flex items-start gap-2 text-ink">
                <CheckCircle size={13} className="text-success shrink-0 mt-0.5" />
                <span>Fully customizable — add databases, properties, and adapt structure to your style.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
