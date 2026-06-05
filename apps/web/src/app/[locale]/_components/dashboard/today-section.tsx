"use client";

import { TodayCard } from "./today-card";
import { useAppContext } from "@/context/app-context";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { getRecords } from "@/lib/api/record";
import { queryKeys } from "@/lib/api/query-keys";
import { createRecord } from "@/lib/api/record";
import { useUIContext } from "@/context/ui-context";
import { motion, type Variants } from "framer-motion";
import type { RecordResponseDto } from "@fixspace/domain";
import { useTranslations } from "next-intl";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
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

export function TodaySection() {
  const { databases } = useAppContext();
  const queryClient = useQueryClient();
  const { showError } = useUIContext();
  const t = useTranslations("Dashboard");

  const sections = [
    { title: t("tradingJournal"), key: "Trading Journal", iconColor: "text-accent" },
    { title: t("sessionRoutine"), key: "Session Routine", iconColor: "text-success" },
    { title: t("notes"), key: "Notes", iconColor: "text-warning" },
    { title: t("mistakes"), key: "Mistakes", iconColor: "text-error" },
  ];

  const dbInfos = sections.map((sec) => ({
    ...sec,
    db: databases.find((d) => d.title === sec.key),
  }));

  const results = useQueries({
    queries: dbInfos.map((info) => ({
      queryKey: info.db ? queryKeys.records.all(info.db.id) : ["records", "undefined"],
      queryFn: () => (info.db ? getRecords(info.db.id) : Promise.resolve([])),
      enabled: !!info.db,
    })),
  });

  const handleAdd = async (dbId: string) => {
    try {
      await createRecord(dbId, {});
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all(dbId) });
    } catch (err) {
      showError(err);
    }
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-ink mb-4">{t("today")}</h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {dbInfos.map((info, idx) => {
          const result = results[idx];
          const data = result?.data;
          const isLoading = result?.isLoading;

          const todayRecords =
            data?.filter((r: RecordResponseDto) => {
              const recordDate = new Date(r.createdAt);
              return recordDate >= todayStart;
            }) || [];

          return (
            <motion.div key={info.key} variants={itemVariants}>
              <TodayCard
                title={info.key === "Session Routine" ? t("dailyRoutine") : info.title}
                records={todayRecords}
                iconColor={info.iconColor}
                isLoading={isLoading}
                onAdd={() => info.db && handleAdd(info.db.id)}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
