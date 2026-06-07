export interface MarketSession {
  name: string;
  isOpen: boolean;
  openingTime: string;
}

export interface WorkflowStep {
  name: string;
  isCompleted: boolean;
  databaseId?: string;
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
    tradingJournal: any[];
    dailyRoutine: any[];
    notes: any[];
    mistakes: any[];
  };
  overviewCharts: {
    pnlCurve: any;
    winRateDynamics: any;
    rrDeviation: any;
  };
}
