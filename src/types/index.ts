import { Category, Transaction } from "@prisma/client";

export type TransactionType = "INCOME" | "EXPENSE";

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface DashboardStats {
  totalBalance: number;
  monthIncome: number;
  monthExpenses: number;
  monthNet: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
  recentTransactions: TransactionWithCategory[];
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
