"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/primitives/display/card";
import { Select } from "@/components/ui/primitives/inputs/select";
import { DateInput } from "@/components/ui/primitives/inputs/date-input";
import { Button } from "@/components/ui/primitives/actions/button";
import { TabSwitcher, type TabItem } from "@/components/ui/primitives/navigation/tab-switcher";
import { AreaChartWrapper } from "@/features/charts/components/area-chart";
import { BarChartWrapper } from "@/features/charts/components/bar-chart";
import { useTheme } from "@/context/theme-context";
import { useTranslations, useFormatter } from "next-intl";
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  LineChart,
  Activity,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Filter,
  Layers,
  User,
  ExternalLink,
  Zap,
  BarChart2,
  PieChart,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = "overview" | "patterns" | "behavior" | "accounts";

interface Trade {
  id: string;
  date: string;
  asset: string;
  entryModel: string;
  pointA: string;
  pointB: string;
  narrativeTimeframe: string;
  dayOfWeek: string;
  session: string;
  pnl: number;
  rr: number;
  entryQuality: number;
  exitQuality: number;
  ruleAdherence: number;
  rrDeviation: number;
  holdTime: string;
  mistakes: string[];
  result: "win" | "loss" | "breakeven";
}

interface BreakdownItem {
  name: string;
  winRate: number;
  avgPnl: number;
  tradeCount: number;
}

interface MistakeEntry {
  name: string;
  frequency: number;
  totalCost: number;
}

interface AccountData {
  id: string;
  name: string;
  balanceHistory: { name: string; balance: number; deposit: number; withdrawal: number }[];
  drawdownHistory: { name: string; drawdown: number }[];
  maxDrawdown: number;
  dailyLimitUsage: { name: string; usage: number }[];
}

// ─── Mock Data Generators ────────────────────────────────────────────────────

const ASSETS = ["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD", "BTC/USD", "ETH/USD"];
const ENTRY_MODELS = ["Break of Structure", "Fair Value Gap", "Order Block", "Liquidity Sweep", "Change of Character"];
const POINTS_A = ["HTF POI", "M15 OB", "H1 FVG", "M5 BOS", "H4 OB"];
const POINTS_B = ["M1 Entry", "M5 Confirmation", "M15 Confirmation", "H1 Confirmation"];
const NARRATIVE_TFS = ["H4", "H1", "M15", "M5"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SESSIONS = ["Asia", "Frankfurt", "London", "New York"];
const MISTAKES = [
  "Early Entry",
  "Late Exit",
  "Overtrading",
  "Moving SL to BE too early",
  "Revenge Trading",
  "Ignoring HTF Bias",
  "Poor Position Sizing",
];
const ACCOUNTS = [
  { id: "acc1", name: "Main Account" },
  { id: "acc2", name: "Prop Firm A" },
  { id: "acc3", name: "Prop Firm B" },
];

const generateTrades = (): Trade[] => {
  const trades: Trade[] = [];
  const startDate = new Date("2025-01-01");
  for (let i = 0; i < 150; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(i * 2.4));
    const pnl = Math.random() > 0.4 ? Math.random() * 600 + 50 : -(Math.random() * 400 + 30);
    const mistakesCount = Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0;
    const tradeMistakes: string[] = [];
    for (let m = 0; m < mistakesCount; m++) {
      const mistake = MISTAKES[Math.floor(Math.random() * MISTAKES.length)]!;
      if (!tradeMistakes.includes(mistake)) tradeMistakes.push(mistake);
    }
    trades.push({
      id: `trade-${i + 1}`,
      date: date.toISOString().split("T")[0]!,
      asset: ASSETS[Math.floor(Math.random() * ASSETS.length)]!,
      entryModel: ENTRY_MODELS[Math.floor(Math.random() * ENTRY_MODELS.length)]!,
      pointA: POINTS_A[Math.floor(Math.random() * POINTS_A.length)]!,
      pointB: POINTS_B[Math.floor(Math.random() * POINTS_B.length)]!,
      narrativeTimeframe: NARRATIVE_TFS[Math.floor(Math.random() * NARRATIVE_TFS.length)]!,
      dayOfWeek: DAYS[Math.floor(Math.random() * DAYS.length)]!,
      session: SESSIONS[Math.floor(Math.random() * SESSIONS.length)]!,
      pnl: parseFloat(pnl.toFixed(2)),
      rr: parseFloat((Math.random() * 5 + 0.2).toFixed(2)),
      entryQuality: Math.floor(Math.random() * 5) + 1,
      exitQuality: Math.floor(Math.random() * 5) + 1,
      ruleAdherence: Math.floor(Math.random() * 5) + 1,
      rrDeviation: parseFloat((Math.random() * 2 - 0.5).toFixed(2)),
      holdTime: `${Math.floor(Math.random() * 8)}h ${Math.floor(Math.random() * 60)}m`,
      mistakes: tradeMistakes,
      result: pnl > 10 ? "win" : pnl < -10 ? "loss" : "breakeven",
    });
  }
  return trades;
};

const generateAccountData = (): AccountData[] => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return ACCOUNTS.map((acc) => {
    let balance = 10000 + Math.random() * 5000;
    let maxDD = 0;
    let currentDD = 0;
    const balanceHistory = months.map((month) => {
      const change = Math.random() * 1200 - 400;
      balance += change;
      const deposit = Math.random() > 0.8 ? Math.floor(Math.random() * 2000) : 0;
      const withdrawal = Math.random() > 0.85 ? Math.floor(Math.random() * 1000) : 0;
      balance += deposit - withdrawal;
      currentDD = change < 0 ? currentDD + Math.abs(change) : Math.max(0, currentDD - Math.abs(change) * 0.5);
      if (currentDD > maxDD) maxDD = currentDD;
      return {
        name: month,
        balance: parseFloat(balance.toFixed(0)),
        deposit,
        withdrawal,
      };
    });
    const drawdownHistory = months.map((_, i) => ({
      name: months[i]!,
      drawdown: parseFloat((Math.random() * maxDD * 0.8).toFixed(0)),
    }));
    const dailyLimitUsage = Array.from({ length: 30 }, (_, i) => ({
      name: `Day ${i + 1}`,
      usage: parseFloat((Math.random() * 100).toFixed(1)),
    }));
    return {
      id: acc.id,
      name: acc.name,
      balanceHistory,
      drawdownHistory,
      maxDrawdown: parseFloat(maxDD.toFixed(0)),
      dailyLimitUsage,
    };
  });
};

const MOCK_TRADES = generateTrades();
const MOCK_ACCOUNTS = generateAccountData();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPercent = (v: number) => `${v.toFixed(1)}%`;

interface StatWithCompareProps {
  label: string;
  current: string | number;
  previous?: string | number;
  higherIsBetter?: boolean;
}

function StatWithCompare({ label, current, previous, higherIsBetter = true }: StatWithCompareProps) {
  const hasCompare = previous !== undefined;
  let trend: { positive: boolean; value: string } | null = null;

  if (hasCompare && typeof current === "number" && typeof previous === "number") {
    const diff = current - previous;
    const pct = previous !== 0 ? (diff / Math.abs(previous)) * 100 : 0;
    const positive = higherIsBetter ? diff >= 0 : diff <= 0;
    trend = { positive, value: `${diff >= 0 ? "+" : ""}${pct.toFixed(1)}%` };
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-lg font-semibold text-ink">{current}</span>
        {trend && (
          <span
            className={`text-[10px] font-medium flex items-center ${trend.positive ? "text-success" : "text-error"}`}
          >
            {trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
      </div>
      <div className="text-xs text-ink-muted">{label}</div>
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function StatisticsPage() {
  const t = useTranslations("Statistics");
  const { theme } = useTheme();
  const format = useFormatter();

  const formatCurrency = (v: number) =>
    `${v >= 0 ? "+" : ""}${format.number(Math.abs(v), { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-12-31");
  const [compareMode, setCompareMode] = useState(false);
  const [compareDateFrom, setCompareDateFrom] = useState("2024-01-01");
  const [compareDateTo, setCompareDateTo] = useState("2024-12-31");
  const [selectedAccountDetail, setSelectedAccountDetail] = useState("all");

  const colors = useMemo(() => {
    if (theme === "light") {
      return {
        accent: "#2563eb",
        success: "#1fb44e",
        error: "#da373c",
        warning: "#f59e0b",
        muted: "#6b7280",
      };
    }
    return {
      accent: "hsl(221, 83%, 53%)",
      success: "#57f287",
      error: "#ed4245",
      warning: "#f59e0b",
      muted: "#6b7280",
    };
  }, [theme]);

  const filteredTrades = useMemo(() => {
    return MOCK_TRADES.filter((trade) => {
      if (selectedAssets.length > 0 && !selectedAssets.includes(trade.asset)) return false;
      if (trade.date < dateFrom || trade.date > dateTo) return false;
      return true;
    });
  }, [selectedAssets, dateFrom, dateTo]);

  const compareTrades = useMemo(() => {
    if (!compareMode) return [];
    return MOCK_TRADES.filter((trade) => {
      if (selectedAssets.length > 0 && !selectedAssets.includes(trade.asset)) return false;
      if (trade.date < compareDateFrom || trade.date > compareDateTo) return false;
      return true;
    });
  }, [compareMode, selectedAssets, compareDateFrom, compareDateTo]);

  const tabs: TabItem<TabId>[] = [
    { id: "overview", label: t("tabOverview"), icon: BarChart2 },
    { id: "patterns", label: t("tabPatterns"), icon: PieChart },
    { id: "behavior", label: t("tabBehavior"), icon: Activity },
    { id: "accounts", label: t("tabAccounts"), icon: User },
  ];

  // ─── Computed Stats ──────────────────────────────────────────────────────

  const computeStats = (trades: Trade[]) => {
    const wins = trades.filter((tr) => tr.result === "win");
    const losses = trades.filter((tr) => tr.result === "loss");
    const totalPnl = trades.reduce((sum, tr) => sum + tr.pnl, 0);
    const grossProfit = wins.reduce((sum, tr) => sum + tr.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, tr) => sum + tr.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const avgPnl = trades.length > 0 ? totalPnl / trades.length : 0;
    const avgRR = trades.length > 0 ? trades.reduce((s, tr) => s + tr.rr, 0) / trades.length : 0;
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
    const bestTrade =
      trades.length > 0 ? trades.reduce((best, tr) => (tr.pnl > best!.pnl ? tr : best), trades[0]) : null;
    const worstTrade =
      trades.length > 0 ? trades.reduce((worst, tr) => (tr.pnl < worst!.pnl ? tr : worst), trades[0]) : null;
    const parseHoldTime = (ht: string) => {
      const match = ht.match(/(\d+)h\s*(\d+)m/);
      if (!match) return 0;
      return parseInt(match[1]!) * 60 + parseInt(match[2]!);
    };
    const avgHoldTimeMs =
      trades.length > 0 ? trades.reduce((s, tr) => s + parseHoldTime(tr.holdTime), 0) / trades.length : 0;
    const avgHoldHours = Math.floor(avgHoldTimeMs / 60);
    const avgHoldMinutes = Math.round(avgHoldTimeMs % 60);
    const avgHoldTime = `${avgHoldHours}h ${avgHoldMinutes}m`;

    return {
      totalTrades: trades.length,
      winRate,
      profitFactor,
      avgPnl,
      avgRR,
      totalPnl,
      bestTrade,
      worstTrade,
      avgHoldTime,
    };
  };

  const stats = useMemo(() => computeStats(filteredTrades), [filteredTrades]);
  const compareStats = useMemo(() => computeStats(compareTrades), [compareTrades]);

  // ─── Overview Chart Data ─────────────────────────────────────────────────

  const pnlCurveData = useMemo(() => {
    let cumulative = 0;
    return filteredTrades
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((tr, i) => {
        cumulative += tr.pnl;
        return { name: `#${i + 1}`, pnl: parseFloat(cumulative.toFixed(0)) };
      });
  }, [filteredTrades]);

  const pnlCompareData = useMemo(() => {
    if (!compareMode) return [];
    let cumulative = 0;
    return compareTrades
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((tr, i) => {
        cumulative += tr.pnl;
        return { name: `#${i + 1}`, pnl: parseFloat(cumulative.toFixed(0)) };
      });
  }, [compareMode, compareTrades]);

  const equityCurveData = useMemo(() => {
    let equity = 10000;
    const deposits = [2000, 0, 0, 0, 1500, 0, 0, 0, 0, 0, 0, 0];
    const withdrawals = [0, 0, 0, 500, 0, 0, 0, 0, 0, 800, 0, 0];
    return filteredTrades
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((tr, i) => {
        equity += tr.pnl;
        const monthIdx = Math.floor((i / filteredTrades.length) * 12);
        if (deposits[monthIdx]) equity += deposits[monthIdx]!;
        if (withdrawals[monthIdx]) equity -= withdrawals[monthIdx]!;
        return { name: `#${i + 1}`, equity: parseFloat(equity.toFixed(0)) };
      });
  }, [filteredTrades]);

  // ─── Patterns Breakdowns ─────────────────────────────────────────────────

  const getBreakdown = (key: keyof Trade): BreakdownItem[] => {
    const groups: Record<string, Trade[]> = {};
    filteredTrades.forEach((tr) => {
      const val = String(tr[key]);
      if (!groups[val]) groups[val] = [];
      groups[val].push(tr);
    });
    return Object.entries(groups).map(([name, trades]) => {
      const wins = trades.filter((tr) => tr.result === "win").length;
      return {
        name,
        winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
        avgPnl: trades.length > 0 ? trades.reduce((s, tr) => s + tr.pnl, 0) / trades.length : 0,
        tradeCount: trades.length,
      };
    });
  };

  const breakdownByAsset = getBreakdown("asset");
  const breakdownByEntryModel = getBreakdown("entryModel");
  const breakdownByPointA = getBreakdown("pointA");
  const breakdownByPointB = getBreakdown("pointB");
  const breakdownByNarrativeTF = getBreakdown("narrativeTimeframe");
  const breakdownByDay = getBreakdown("dayOfWeek");
  const breakdownBySession = getBreakdown("session");

  // ─── Behavior Chart Data ─────────────────────────────────────────────────

  const qualityOverTime = useMemo(() => {
    return filteredTrades
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 50)
      .map((tr, i) => ({
        name: `#${i + 1}`,
        entryQuality: tr.entryQuality,
        exitQuality: tr.exitQuality,
        ruleAdherence: tr.ruleAdherence,
        rrDeviation: tr.rrDeviation,
      }));
  }, [filteredTrades]);

  const mistakesData = useMemo((): MistakeEntry[] => {
    const map: Record<string, { frequency: number; totalCost: number }> = {};
    filteredTrades.forEach((tr) => {
      tr.mistakes.forEach((m) => {
        if (!map[m]) map[m] = { frequency: 0, totalCost: 0 };
        map[m].frequency++;
        if (tr.pnl < 0) map[m].totalCost += Math.abs(tr.pnl);
      });
    });
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredTrades]);

  const rulesVsPnlData = useMemo(() => {
    const groups: Record<number, number[]> = {};
    filteredTrades.forEach((tr) => {
      const key = tr.ruleAdherence;
      if (!groups[key]) groups[key] = [];
      groups[key].push(tr.pnl);
    });
    return Object.entries(groups)
      .map(([rating, pnls]) => ({
        name: `${rating}/5`,
        avgPnl: parseFloat((pnls.reduce((s, v) => s + v, 0) / pnls.length).toFixed(0)),
      }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));
  }, [filteredTrades]);

  // ─── Accounts Data ───────────────────────────────────────────────────────

  const selectedAccountsData = useMemo(() => {
    if (selectedAccountDetail === "all") return MOCK_ACCOUNTS;
    return MOCK_ACCOUNTS.filter((a) => a.id === selectedAccountDetail);
  }, [selectedAccountDetail]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="relative flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-70" />

      <main className="relative z-10 flex-1 overflow-y-auto scrollbar p-6 md:p-8 lg:p-10 w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-ink mb-2">{t("title")}</h1>
          <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
        </div>

        {/* ─── Global Filter Bar ─────────────────────────────────────── */}
        <Card className="mb-6 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-ink-muted" />
            <span className="text-sm font-medium text-ink">{t("filters")}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">{t("filterAccount")}</label>
              <Select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                options={[
                  { value: "all", label: t("allAccounts") },
                  ...ACCOUNTS.map((a) => ({ value: a.id, label: a.name })),
                ]}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">{t("filterPeriod")}</label>
              <div className="flex gap-2">
                <DateInput value={dateFrom} onChange={setDateFrom} size="sm" />
                <DateInput value={dateTo} onChange={setDateTo} size="sm" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">{t("filterAssets")}</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {ASSETS.map((asset) => {
                  const active = selectedAssets.length === 0 || selectedAssets.includes(asset);
                  return (
                    <button
                      key={asset}
                      type="button"
                      onClick={() => {
                        if (selectedAssets.includes(asset)) {
                          setSelectedAssets(selectedAssets.filter((a) => a !== asset));
                        } else {
                          setSelectedAssets([...selectedAssets, asset]);
                        }
                      }}
                      className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${
                        active
                          ? "bg-accent/10 border-accent/30 text-accent"
                          : "bg-surface border-stroke text-ink-muted hover:text-ink"
                      }`}
                    >
                      {asset}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">{t("compareMode")}</label>
              <div className="flex items-center gap-2">
                <Button
                  variant={compareMode ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setCompareMode(!compareMode)}
                >
                  {compareMode ? t("compareOn") : t("compareOff")}
                </Button>
                {compareMode && (
                  <div className="flex gap-1">
                    <DateInput value={compareDateFrom} onChange={setCompareDateFrom} size="sm" />
                    <DateInput value={compareDateTo} onChange={setCompareDateTo} size="sm" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ─── Tab Switcher ──────────────────────────────────────────── */}
        <div className="mb-6">
          <TabSwitcher items={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        {/* ─── Tab 1: Overview ───────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* P&L Curve */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-ink-muted" />
                <h3 className="font-medium text-ink">{t("pnlCurve")}</h3>
              </div>
              <div className="h-64 -ml-4">
                <AreaChartWrapper
                  data={pnlCurveData}
                  dataKey="pnl"
                  name="Cumulative P&L"
                  color={colors.accent}
                  gradientId="pnlGradient"
                />
              </div>
              {compareMode && pnlCompareData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-stroke">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-ink-muted">{t("comparePeriod")}</span>
                  </div>
                  <div className="h-40 -ml-4">
                    <AreaChartWrapper
                      data={pnlCompareData}
                      dataKey="pnl"
                      name="Compare P&L"
                      color={colors.muted}
                      gradientId="pnlCompareGradient"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Equity Curve */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="w-4 h-4 text-ink-muted" />
                <h3 className="font-medium text-ink">{t("equityCurve")}</h3>
              </div>
              <div className="h-64 -ml-4">
                <AreaChartWrapper
                  data={equityCurveData}
                  dataKey="equity"
                  name="Equity"
                  color={colors.success}
                  gradientId="equityGradient"
                />
              </div>
            </Card>

            {/* Summary KPI Table */}
            <Card className="p-4">
              <h3 className="font-medium text-ink mb-4">{t("summaryKpi")}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                <StatWithCompare
                  label={t("totalPnL")}
                  current={formatCurrency(stats.totalPnl)}
                  previous={compareMode ? compareStats.totalPnl : undefined}
                />
                <StatWithCompare
                  label={t("winRate")}
                  current={formatPercent(stats.winRate)}
                  previous={compareMode ? compareStats.winRate : undefined}
                />
                <StatWithCompare
                  label={t("profitFactor")}
                  current={stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}
                  previous={
                    compareMode ? (compareStats.profitFactor === Infinity ? "∞" : compareStats.profitFactor) : undefined
                  }
                />
                <StatWithCompare
                  label={t("avgPnlPerTrade")}
                  current={formatCurrency(stats.avgPnl)}
                  previous={compareMode ? compareStats.avgPnl : undefined}
                />
                <StatWithCompare
                  label={t("avgActualRR")}
                  current={`${stats.avgRR.toFixed(2)}R`}
                  previous={compareMode ? compareStats.avgRR : undefined}
                />
                <StatWithCompare
                  label={t("totalTrades")}
                  current={stats.totalTrades}
                  previous={compareMode ? compareStats.totalTrades : undefined}
                />
                <StatWithCompare label={t("avgHoldTime")} current={stats.avgHoldTime} />
              </div>
            </Card>

            {/* Best & Worst Trade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.bestTrade && (
                <Card className="p-4 border-success/30">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpRight className="w-4 h-4 text-success" />
                    <h3 className="font-medium text-success">{t("bestTrade")}</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">{t("pnl")}</span>
                      <span className="font-semibold text-success">{formatCurrency(stats.bestTrade.pnl)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">{t("asset")}</span>
                      <span className="text-ink">{stats.bestTrade.asset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">{t("rr")}</span>
                      <span className="text-ink">{stats.bestTrade.rr}R</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">{t("date")}</span>
                      <span className="text-ink">{stats.bestTrade.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 w-full">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {t("viewTrade")}
                  </Button>
                </Card>
              )}
              {stats.worstTrade && (
                <Card className="p-4 border-error/30">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowDownRight className="w-4 h-4 text-error" />
                    <h3 className="font-medium text-error">{t("worstTrade")}</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">{t("pnl")}</span>
                      <span className="font-semibold text-error">{formatCurrency(stats.worstTrade.pnl)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">{t("asset")}</span>
                      <span className="text-ink">{stats.worstTrade.asset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">{t("rr")}</span>
                      <span className="text-ink">{stats.worstTrade.rr}R</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">{t("date")}</span>
                      <span className="text-ink">{stats.worstTrade.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 w-full">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {t("viewTrade")}
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* ─── Tab 2: Patterns ───────────────────────────────────────── */}
        {activeTab === "patterns" && (
          <div className="space-y-6">
            {[
              { title: t("byAsset"), data: breakdownByAsset },
              { title: t("byEntryModel"), data: breakdownByEntryModel },
              { title: t("byPointA"), data: breakdownByPointA },
              { title: t("byPointB"), data: breakdownByPointB },
              { title: t("byNarrativeTF"), data: breakdownByNarrativeTF },
              { title: t("byDayOfWeek"), data: breakdownByDay },
              { title: t("bySession"), data: breakdownBySession },
            ].map((section) => (
              <Card key={section.title} className="p-4">
                <h3 className="font-medium text-ink mb-4">{section.title}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stroke">
                        <th className="text-left py-2 px-3 text-ink-muted font-medium">{t("name")}</th>
                        <th className="text-right py-2 px-3 text-ink-muted font-medium">{t("winRate")}</th>
                        <th className="text-right py-2 px-3 text-ink-muted font-medium">{t("avgPnl")}</th>
                        <th className="text-right py-2 px-3 text-ink-muted font-medium">{t("tradeCount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.data.map((item) => (
                        <tr key={item.name} className="border-b border-stroke/50 hover:bg-surface/50">
                          <td className="py-2 px-3 text-ink">{item.name}</td>
                          <td className="py-2 px-3 text-right">
                            <span className={item.winRate >= 50 ? "text-success" : "text-error"}>
                              {formatPercent(item.winRate)}
                            </span>
                          </td>
                          <td className={`py-2 px-3 text-right ${item.avgPnl >= 0 ? "text-success" : "text-error"}`}>
                            {formatCurrency(item.avgPnl)}
                          </td>
                          <td className="py-2 px-3 text-right text-ink-secondary">{item.tradeCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 h-48 -ml-4">
                  <BarChartWrapper
                    data={section.data.map((d) => ({ name: d.name, winRate: parseFloat(d.winRate.toFixed(1)) }))}
                    dataKey="winRate"
                    name="Win Rate %"
                    color={colors.warning}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ─── Tab 3: Behavior ───────────────────────────────────────── */}
        {activeTab === "behavior" && (
          <div className="space-y-6">
            {/* Quality Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-ink-muted" />
                  <h3 className="font-medium text-ink">{t("entryQualityOverTime")}</h3>
                </div>
                <div className="h-56 -ml-4">
                  <AreaChartWrapper
                    data={qualityOverTime}
                    dataKey="entryQuality"
                    name="Entry Quality"
                    color={colors.accent}
                    gradientId="entryQualityGradient"
                  />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-ink-muted" />
                  <h3 className="font-medium text-ink">{t("exitQualityOverTime")}</h3>
                </div>
                <div className="h-56 -ml-4">
                  <AreaChartWrapper
                    data={qualityOverTime}
                    dataKey="exitQuality"
                    name="Exit Quality"
                    color={colors.warning}
                    gradientId="exitQualityGradient"
                  />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4 text-ink-muted" />
                  <h3 className="font-medium text-ink">{t("ruleAdherenceOverTime")}</h3>
                </div>
                <div className="h-56 -ml-4">
                  <AreaChartWrapper
                    data={qualityOverTime}
                    dataKey="ruleAdherence"
                    name="Rule Adherence"
                    color={colors.success}
                    gradientId="ruleAdherenceGradient"
                  />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-ink-muted" />
                  <h3 className="font-medium text-ink">{t("rrDeviationCurve")}</h3>
                </div>
                <div className="h-56 -ml-4">
                  <AreaChartWrapper
                    data={qualityOverTime}
                    dataKey="rrDeviation"
                    name="RR Deviation"
                    color={colors.error}
                    gradientId="rrDeviationGradient"
                  />
                </div>
              </Card>
            </div>

            {/* Mistakes Table */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-ink-muted" />
                <h3 className="font-medium text-ink">{t("mistakesTable")}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stroke">
                      <th className="text-left py-2 px-3 text-ink-muted font-medium">#</th>
                      <th className="text-left py-2 px-3 text-ink-muted font-medium">{t("mistake")}</th>
                      <th className="text-right py-2 px-3 text-ink-muted font-medium">{t("frequency")}</th>
                      <th className="text-right py-2 px-3 text-ink-muted font-medium">{t("totalCost")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mistakesData.map((m, i) => (
                      <tr key={m.name} className="border-b border-stroke/50 hover:bg-surface/50">
                        <td className="py-2 px-3 text-ink-muted">{i + 1}</td>
                        <td className="py-2 px-3 text-ink">{m.name}</td>
                        <td className="py-2 px-3 text-right text-ink-secondary">{m.frequency}</td>
                        <td className="py-2 px-3 text-right text-error">{formatCurrency(-m.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Rules Adherence vs P&L */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-ink-muted" />
                <h3 className="font-medium text-ink">{t("rulesVsPnl")}</h3>
              </div>
              <div className="h-64 -ml-4">
                <BarChartWrapper data={rulesVsPnlData} dataKey="avgPnl" name="Avg P&L" color={colors.accent} />
              </div>
            </Card>
          </div>
        )}

        {/* ─── Tab 4: Accounts ───────────────────────────────────────── */}
        {activeTab === "accounts" && (
          <div className="space-y-6">
            {/* Account Selector */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-ink-muted" />
                <span className="text-sm font-medium text-ink">{t("selectAccount")}</span>
                <Select
                  value={selectedAccountDetail}
                  onChange={(e) => setSelectedAccountDetail(e.target.value)}
                  options={[
                    { value: "all", label: t("allAccounts") },
                    ...ACCOUNTS.map((a) => ({ value: a.id, label: a.name })),
                  ]}
                />
              </div>
            </Card>

            {selectedAccountsData.map((account) => (
              <div key={account.id} className="space-y-4">
                <h3 className="text-lg font-semibold text-ink">{account.name}</h3>

                {/* Balance Dynamics */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-4 h-4 text-ink-muted" />
                    <h3 className="font-medium text-ink">{t("balanceDynamics")}</h3>
                  </div>
                  <div className="h-64 -ml-4">
                    <AreaChartWrapper
                      data={account.balanceHistory}
                      dataKey="balance"
                      name="Balance"
                      color={colors.accent}
                      gradientId={`balanceGradient-${account.id}`}
                    />
                  </div>
                </Card>

                {/* Drawdown Curve */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="w-4 h-4 text-ink-muted" />
                    <h3 className="font-medium text-ink">
                      {t("drawdownCurve")}{" "}
                      <span className="text-error text-sm">
                        ({t("maxDrawdown")}: {formatCurrency(-account.maxDrawdown)})
                      </span>
                    </h3>
                  </div>
                  <div className="h-56 -ml-4">
                    <AreaChartWrapper
                      data={account.drawdownHistory}
                      dataKey="drawdown"
                      name="Drawdown"
                      color={colors.error}
                      gradientId={`drawdownGradient-${account.id}`}
                    />
                  </div>
                </Card>

                {/* Daily Limit Usage */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Percent className="w-4 h-4 text-ink-muted" />
                    <h3 className="font-medium text-ink">{t("dailyLimitUsage")}</h3>
                  </div>
                  <div className="h-56 -ml-4">
                    <BarChartWrapper
                      data={account.dailyLimitUsage}
                      dataKey="usage"
                      name="Limit Usage %"
                      color={colors.warning}
                    />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
