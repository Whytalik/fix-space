import { Injectable, NotFoundException } from "@nestjs/common";
import { DashboardResponseDto, MarketSession } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { RecordRepository } from "@/modules/record/repositories/record.repository";
import { SpaceRepository } from "../repositories/space.repository";

@Injectable()
export class GetDashboardUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly spaceRepo: SpaceRepository,
    private readonly recordRepo: RecordRepository,
  ) {
    this.logger.setContext(GetDashboardUseCase.name);
  }

  private getMarketSessions(): { active: MarketSession[]; next: string } {
    const now = new Date();
    const hour = now.getUTCHours();

    const sessions = [
      { name: "Tokyo", start: 0, end: 9 },
      { name: "Frankfurt", start: 7, end: 16 },
      { name: "London", start: 8, end: 17 },
      { name: "New York", start: 13, end: 22 },
    ];

    const active = sessions
      .filter((s) => hour >= s.start && hour < s.end)
      .map((s) => ({ name: s.name, isOpen: true, openingTime: `${s.start}:00` }));

    const nextSession = sessions.find((s) => hour < s.start) ?? sessions[0]!;
    const next = `${nextSession.start}:00`;

    return { active, next };
  }

  async execute(spaceId: string): Promise<DashboardResponseDto> {
    this.logger.debug("Getting dashboard", { spaceId });

    const space = await this.spaceRepo.findOne(spaceId, { databases: true });
    if (!space) {
      throw new NotFoundException(t("errors.SPACE_NOT_FOUND_ID", { id: spaceId }));
    }

    const databases = space.databases ?? [];

    const journalDb = databases.find((db) => db.type === "trading-journal");
    const routineDb = databases.find((db) => db.type === "daily-routine");
    const notesDb = databases.find((db) => db.type === "notes");
    const mistakesDb = databases.find((db) => db.type === "mistakes");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const getTodayRecords = async (databaseId: string | undefined) => {
      if (!databaseId) return [];
      return this.recordRepo.findWithFilters(databaseId, space.ownerId, {
        createdAt: { gte: startOfDay, lte: endOfDay },
      });
    };

    const tradingJournal = await getTodayRecords(journalDb?.id);
    const dailyRoutine = await getTodayRecords(routineDb?.id);
    const notes = await getTodayRecords(notesDb?.id);
    const mistakes = await getTodayRecords(mistakesDb?.id);

    const { active, next } = this.getMarketSessions();

    this.logger.log("Dashboard retrieved", { spaceId });

    return {
      marketSessions: {
        currentTime: new Date().toISOString(),
        dayOfWeek: new Date().toLocaleDateString("en-US", { weekday: "long" }),
        activeSessions: active,
        nextSessionOpening: next,
      },
      dailyWorkflow: [
        { name: "Plan Routine", isCompleted: dailyRoutine.length > 0, databaseId: routineDb?.id, recordCount: dailyRoutine.length },
        { name: "Execute Trade", isCompleted: tradingJournal.length > 0, databaseId: journalDb?.id, recordCount: tradingJournal.length },
        { name: "Reflect Notes", isCompleted: notes.length > 0, databaseId: notesDb?.id, recordCount: notes.length },
        { name: "Log Mistakes", isCompleted: mistakes.length > 0, databaseId: mistakesDb?.id, recordCount: mistakes.length },
      ],
      todayItems: {
        tradingJournal: { title: journalDb?.title ?? "Trading Journal", databaseId: journalDb?.id, records: tradingJournal },
        dailyRoutine: { title: routineDb?.title ?? "Daily Routine", databaseId: routineDb?.id, records: dailyRoutine },
        notes: { title: notesDb?.title ?? "Notes", databaseId: notesDb?.id, records: notes },
        mistakes: { title: mistakesDb?.title ?? "Mistakes", databaseId: mistakesDb?.id, records: mistakes },
      },
    };
  }
}
