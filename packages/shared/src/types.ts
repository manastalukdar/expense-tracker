export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: Date;
  currency: Currency;
  tags?: string[];
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentId?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: BudgetPeriod;
  categories: string[];
  startDate: Date;
  endDate?: Date;
  currency: Currency;
}

export enum BudgetPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ExpenseFilter {
  categories?: string[];
  dateRange?: DateRange;
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
  tags?: string[];
}

export interface ExpenseStats {
  totalAmount: number;
  averageAmount: number;
  expenseCount: number;
  categoryBreakdown: CategorySummary[];
  periodBreakdown: PeriodSummary[];
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
}

export interface PeriodSummary {
  period: string;
  totalAmount: number;
  expenseCount: number;
}

export interface UserPreferences {
  defaultCurrency: Currency;
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  firstDayOfWeek: number;
}