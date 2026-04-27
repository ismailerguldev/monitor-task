export type DashboardAnalytics = {
  total_tasks: number;
  completed_tasks: number;
  delayed_tasks: number;
  daily_completed: number;
  weekly_completed: number;
  most_productive_hour: number | null;
  delayed_ratio: number;
  suggestions: {
    general: string;
    daily: string;
    productivity: string;
  };
};