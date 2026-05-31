"use client";

import { useAppContext } from "@/context/app-context";
import { useEffect, useState } from "react";
import { SessionIndicator } from "./dashboard/session-indicator";
import { TodaySection } from "./dashboard/today-section";
import { DashboardCharts } from "./dashboard/dashboard-charts";
import { Button } from "@/components/ui/primitives/actions/button";
import { PlusCircle, FileText, AlertTriangle, ListChecks, ChevronRight, CheckCircle2 } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { createRecord, getRecords } from "@/lib/api/record";
import type { RecordResponseDto } from "@fixspace/domain";
import { useRouter } from "next/navigation";
import { useUIContext } from "@/context/ui-context";
import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export function DashboardView() {
  const t = useTranslations("Dashboard");
  const { user, isLoading, databases } = useAppContext();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { showError } = useUIContext();

  const routineDb = databases.find((d) => d.title === "Session Routine");
  const journalDb = databases.find((d) => d.title === "Trading Journal");
  const notesDb = databases.find((d) => d.title === "Notes");
  const mistakesDb = databases.find((d) => d.title === "Mistakes");

  const results = useQueries({
    queries: [
      {
        queryKey: ["records", routineDb?.id],
        queryFn: () => (routineDb ? getRecords(routineDb.id) : Promise.resolve([])),
        enabled: !!routineDb,
      },
      {
        queryKey: ["records", journalDb?.id],
        queryFn: () => (journalDb ? getRecords(journalDb.id) : Promise.resolve([])),
        enabled: !!journalDb,
      },
      {
        queryKey: ["records", notesDb?.id],
        queryFn: () => (notesDb ? getRecords(notesDb.id) : Promise.resolve([])),
        enabled: !!notesDb,
      },
      {
        queryKey: ["records", mistakesDb?.id],
        queryFn: () => (mistakesDb ? getRecords(mistakesDb.id) : Promise.resolve([])),
        enabled: !!mistakesDb,
      },
    ],
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const hasTodayRecord = (data: RecordResponseDto[] | undefined | unknown) => {
    if (!data || !Array.isArray(data)) return false;
    return (data as RecordResponseDto[]).some((r) => new Date(r.createdAt) >= todayStart);
  };

  const workflowStatus = {
    routine: hasTodayRecord(results[0].data),
    trade: hasTodayRecord(results[1].data),
    notes: hasTodayRecord(results[2].data),
    mistakes: hasTodayRecord(results[3].data),
  };

  const handleCreate = async (dbId: string | undefined) => {
    if (!dbId) return;
    try {
      const record = await createRecord(dbId, {});
      router.push(`/record/${record.id}?edit=true`);
    } catch (err) {
      showError(err);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-70" />

      <main className="relative z-10 flex-1 overflow-y-auto scrollbar p-6 md:p-8 lg:p-10 w-full">
        <motion.div variants={pageVariants} initial="hidden" animate="show">
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-6 mb-10"
          >
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-semibold text-ink mb-2">
                {t("welcome")}, <span className="text-accent">{user.username}</span>
              </h1>
              <p className="text-sm text-ink-secondary">{t("tradingOverview")}</p>
            </div>

            <div className="flex items-stretch">
              <SessionIndicator />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mb-10 bg-gradient-to-r from-surface to-elevated/30 rounded-xl border border-stroke shadow-sm overflow-hidden flex flex-col xl:flex-row relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="bg-elevated px-5 py-4 flex items-center xl:justify-center border-b xl:border-b-0 xl:border-r border-stroke relative z-10">
              <span className="text-sm font-semibold text-ink-secondary whitespace-nowrap uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {t("dailyWorkflow")}
              </span>
            </div>
            <div className="p-3 md:p-4 flex-1 flex items-center overflow-x-auto scrollbar relative z-10">
              <div className="flex items-center gap-1 md:gap-2 min-w-max px-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCreate(routineDb?.id)}
                  className={`text-sm font-medium transition-colors ${workflowStatus.routine ? "text-success/90 bg-success/10" : "hover:bg-success/10 hover:text-success"}`}
                >
                  <ListChecks className="w-4 h-4 mr-2" /> {t("planRoutine")}
                  {workflowStatus.routine && <CheckCircle2 className="w-3.5 h-3.5 ml-2" />}
                </Button>
                <ChevronRight className="w-4 h-4 text-ink-muted opacity-50 shrink-0" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCreate(journalDb?.id)}
                  className={`text-sm font-medium transition-colors ${workflowStatus.trade ? "text-accent/90 bg-accent/10" : "hover:bg-accent/10 hover:text-accent"}`}
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> {t("executeTrade")}
                  {workflowStatus.trade && <CheckCircle2 className="w-3.5 h-3.5 ml-2" />}
                </Button>
                <ChevronRight className="w-4 h-4 text-ink-muted opacity-50 shrink-0" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCreate(notesDb?.id)}
                  className={`text-sm font-medium transition-colors ${workflowStatus.notes ? "text-warning/90 bg-warning/10" : "hover:bg-warning/10 hover:text-warning"}`}
                >
                  <FileText className="w-4 h-4 mr-2" /> {t("reflectNotes")}
                  {workflowStatus.notes && <CheckCircle2 className="w-3.5 h-3.5 ml-2" />}
                </Button>
                <ChevronRight className="w-4 h-4 text-ink-muted opacity-50 shrink-0" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCreate(mistakesDb?.id)}
                  className={`text-sm font-medium transition-colors ${workflowStatus.mistakes ? "text-error/90 bg-error/10" : "hover:bg-error/10 hover:text-error"}`}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" /> {t("logMistakes")}
                  {workflowStatus.mistakes && <CheckCircle2 className="w-3.5 h-3.5 ml-2" />}
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <TodaySection />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DashboardCharts />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
