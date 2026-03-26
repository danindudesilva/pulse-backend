export type DashboardSummary = {
  opportunities: {
    all: number;
    draft: number;
    sent: number;
    replied: number;
    won: number;
    lost: number;
    paused: number;
  };
  followUps: {
    due: number;
    upcoming: number;
  };
};
