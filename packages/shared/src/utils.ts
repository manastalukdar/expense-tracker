import { format, parseISO, isValid, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { Currency, DateRange, Expense, ExpenseFilter } from './types';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
  }).format(amount);
};

export const formatDate = (date: Date | string, pattern: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, pattern) : '';
};

export const getCurrentMonth = (): DateRange => {
  const now = new Date();
  return {
    startDate: startOfMonth(now),
    endDate: endOfMonth(now),
  };
};

export const getCurrentWeek = (): DateRange => {
  const now = new Date();
  return {
    startDate: startOfWeek(now),
    endDate: endOfWeek(now),
  };
};

export const filterExpenses = (expenses: Expense[], filter: ExpenseFilter): Expense[] => {
  if (!expenses || expenses.length === 0) {
    return [];
  }
  
  return expenses.filter((expense) => {
    // Category filter
    if (filter.categories && filter.categories.length > 0) {
      if (!filter.categories.includes(expense.category.id)) {
        return false;
      }
    }

    // Date range filter
    if (filter.dateRange) {
      const expenseDate = new Date(expense.date);
      if (expenseDate < filter.dateRange.startDate || expenseDate > filter.dateRange.endDate) {
        return false;
      }
    }

    // Amount range filter
    if (filter.minAmount !== undefined && expense.amount < filter.minAmount) {
      return false;
    }
    if (filter.maxAmount !== undefined && expense.amount > filter.maxAmount) {
      return false;
    }

    // Search text filter
    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      const matchesDescription = expense.description?.toLowerCase().includes(searchLower) || false;
      const matchesVendor = expense.vendor.toLowerCase().includes(searchLower);
      const matchesNotes = expense.notes?.toLowerCase().includes(searchLower) || false;
      const matchesTags = expense.tags?.some(tag => tag.name.toLowerCase().includes(searchLower)) || false;
      
      if (!matchesDescription && !matchesVendor && !matchesNotes && !matchesTags) {
        return false;
      }
    }

    // Tags filter
    if (filter.tags && filter.tags.length > 0) {
      if (!expense.tags || !filter.tags.some(tagId => expense.tags!.some(tag => tag.id === tagId))) {
        return false;
      }
    }

    // Payment methods filter
    if (filter.paymentMethods && filter.paymentMethods.length > 0) {
      if (!expense.paymentMethod || !filter.paymentMethods.includes(expense.paymentMethod.id)) {
        return false;
      }
    }

    return true;
  });
};

export const calculateTotal = (expenses: Expense[]): number => {
  if (!expenses || expenses.length === 0) {
    return 0;
  }
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const groupExpensesByCategory = (expenses: Expense[]): Record<string, Expense[]> => {
  if (!expenses || expenses.length === 0) {
    return {};
  }
  return expenses.reduce((groups, expense) => {
    const categoryId = expense.category.id;
    if (!groups[categoryId]) {
      groups[categoryId] = [];
    }
    groups[categoryId].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);
};

export const validateExpense = (expense: Partial<Expense>): string[] => {
  const errors: string[] = [];

  if (!expense.vendor || expense.vendor.trim().length === 0) {
    errors.push('Vendor is required');
  }

  if (!expense.amount || expense.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!expense.category) {
    errors.push('Category is required');
  }

  if (!expense.paymentMethod) {
    errors.push('Payment method is required');
  }

  if (!expense.date) {
    errors.push('Date is required');
  }

  if (!expense.currency) {
    errors.push('Currency is required');
  }

  return errors;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};