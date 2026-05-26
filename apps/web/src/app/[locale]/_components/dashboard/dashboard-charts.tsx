// apps/web/app/_components/dashboard/dashboard-charts.tsx
"use client";

import { Card } from "@/components/ui/primitives/card";
import { BarChart3, LineChart, Activity } from "lucide-react";
import { AreaChartWrapper } from "@/components/charts/area-chart";
import { BarChartWrapper } from "@/components/charts/bar-chart";
import { pnlData, winRateData, rrDeviationData } from "./mock-chart-data";
import { useTheme } from "@/context/theme-context";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

export function DashboardCharts() {
  const { theme } = useTheme();
  const t = useTranslations("Dashboard");

  // Memoize colors to prevent re-renders on theme change if colors are static
  const colors = useMemo(() => {
    // In a real app, you'd get these from CSS variables to be fully dynamic
    if (theme === "light") {
      return {
        accent: "#2563eb",
        success: "#1fb44e",
        error: "#da373c",
      };
    }
    return {
      accent: "hsl(221, 83%, 53%)",
      success: "#57f287",
      error: "#ed4245",
    };
  }, [theme]);

  const charts = [
    {
      title: t("pnlCurve"),
      icon: LineChart,
      component: (
        <AreaChartWrapper data={pnlData} dataKey="pnl" name="PnL" color={colors.accent} gradientId="pnlGradient" />
      ),
    },
    {
      title: t("winRateDynamics"),
      icon: BarChart3,
      component: <BarChartWrapper data={winRateData} dataKey="winrate" name="Win Rate" color={colors.success} />,
    },
    {
      title: t("rrDeviation"),
      icon: Activity,
      component: (
        <AreaChartWrapper
          data={rrDeviationData}
          dataKey="deviation"
          name="RR Deviation"
          color={colors.error}
          gradientId="rrGradient"
        />
      ),
    },
  ];

  return (
    <section>
      <h2 className="text-lg font-semibold text-ink mb-4">{t("overview")}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {charts.map((chart) => (
          <Card key={chart.title} className="flex flex-col h-64">
            <div className="flex items-center gap-2 mb-4">
              <chart.icon className="w-4 h-4 text-ink-secondary" />
              <h3 className="font-medium text-ink">{chart.title}</h3>
            </div>

            <div className="flex-1 -ml-4">{chart.component}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}
