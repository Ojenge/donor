import { Request } from 'express';
import type { JwtPayload } from 'jsonwebtoken';

export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'user';
  first_name: string;
  last_name: string;
  department: string;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreate {
  email: string;
  password: string;
  role: 'admin' | 'user';
  first_name: string;
  last_name: string;
  department: string;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  first_name?: string;
  last_name?: string;
  department?: string;
  is_active?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & {
    id: number;
    email: string;
    role: 'admin' | 'user';
  };
}

export interface ExcelRow {
  'Metric Name'?: string;
  'Category'?: string;
  'Value'?: number;
  'Amount'?: number;
  'Type'?: string;
  'Date'?: string;
}

export interface Project {
  id: number;
  project_name: string;
  state_department: string;
  funding_agency: string;
  budget: number;
  counterpart_funding: number;
  total_expenditure: number;
  completion_rate: number;
  absorption_rate: number;
  coverage: string;
  county: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectMetric {
  id: number;
  project_id: number;
  metric_name: string;
  metric_value: number;
  reporting_period: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Recommendation {
  id: number;
  project_id: number;
  recommendation_text: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  remarks: string;
  due_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectStats {
  total_projects: number;
  total_budget: number;
  total_counterpart_funding: number;
  total_expenditure: number;
  avg_completion_rate: number;
  avg_absorption_rate: number;
}

export interface DepartmentStats {
  state_department: string;
  project_count: number;
  total_budget: number;
  avg_completion_rate: number;
  avg_absorption_rate: number;
}

export interface FundingStats {
  funding_agency: string;
  project_count: number;
  total_budget: number;
  avg_completion_rate: number;
  avg_absorption_rate: number;
}

export interface RecommendationStats {
  priority: string;
  count: number;
  statuses: string;
}

export interface ProjectWithDetails extends Project {
  metrics: string;
  recommendations: string;
} 