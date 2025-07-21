export interface Expense {
  id: string;
  amount: number;
  description?: string;
  vendor: string;
  category: ExpenseCategory;
  date: Date;
  currency: Currency;
  paymentMethod?: PaymentMethod;
  tags?: Tag[];
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
  children?: ExpenseCategory[];
  level?: number; // For nested display
  isExpanded?: boolean; // For UI state
}

export interface PaymentMethod {
  id: string;
  type: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'other';
  name: string;
  alias?: string; // Optional friendly name
  
  // Card-specific fields (all optional for privacy)
  lastFourDigits?: string;
  cardNetwork?: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
  bankName?: string;
  
  // Digital wallet fields
  provider?: string; // e.g., "Apple Pay", "Google Pay", "PayPal"
  
  isDefault?: boolean;
  isActive: boolean;
  color?: string; // For visual identification
  icon?: string; // Custom icon/emoji
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  usageCount?: number; // For statistics
  createdAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
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
  paymentMethods?: string[];
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
  defaultPaymentMethod?: PaymentMethod;
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  firstDayOfWeek: number;
  showPaymentMethodDetails?: boolean; // Privacy setting
}

// Utility types for management
export interface CategoryTree {
  category: ExpenseCategory;
  children: CategoryTree[];
  depth: number;
}

export interface CategoryNode extends ExpenseCategory {
  path: string[]; // Breadcrumb path
  depth: number;
  hasChildren: boolean;
}

export interface PaymentMethodTemplate {
  type: PaymentMethod['type'];
  name: string;
  icon: string;
  color: string;
  cardNetwork?: PaymentMethod['cardNetwork'];
}

export interface TagSuggestion {
  tag: Tag;
  relevance: number; // 0-1 score
  reason: 'frequent' | 'recent' | 'category_match' | 'text_match';
}

// Form types
export interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
  parentId?: string;
}

export interface PaymentMethodFormData {
  type: PaymentMethod['type'];
  name: string;
  alias?: string;
  lastFourDigits?: string;
  cardNetwork?: PaymentMethod['cardNetwork'];
  bankName?: string;
  provider?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

export interface TagFormData {
  name: string;
  color?: string;
  description?: string;
}