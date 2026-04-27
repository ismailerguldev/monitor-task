// ===== USER =====
export interface User {
  id: string;
  name: string;
  last_name: string;
  email: string;
  created_at: string;
}

// ===== TASK =====
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

// ===== ANALYTICS =====
export interface DashboardAnalytics {
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
    weekly: string;
    productivity: string;
  };
}

// ===== API RESPONSE =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiError {
  status: string;
  message: string;
}
