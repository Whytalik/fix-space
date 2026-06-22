export interface MarketSession {
  name: string;
  isOpen: boolean;
  openingTime: string;
}

export interface WorkflowStep {
  name: string;
  isCompleted: boolean;
  databaseId?: string;
  recordCount: number;
}

export interface TodayRecord {
  id: string;
  name: string;
  icon: string | null;
}

export interface TodayDatabaseInfo {
  name: string;
  databaseId?: string;
  records: TodayRecord[];
}

export interface DashboardResponseDto {
  marketSessions: {
    currentTime: string;
    dayOfWeek: string;
    activeSessions: MarketSession[];
    nextSessionOpening: string;
  };
  dailyWorkflow: WorkflowStep[];
  todayItems: {
    tradingJournal: TodayDatabaseInfo;
    dailyRoutine: TodayDatabaseInfo;
    notes: TodayDatabaseInfo;
    mistakes: TodayDatabaseInfo;
  };
}
