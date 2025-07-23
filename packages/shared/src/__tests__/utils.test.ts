import {
  generateId,
  formatCurrency,
  formatDate,
  getCurrentMonth,
  getCurrentWeek,
  filterExpenses,
  calculateTotal,
  groupExpensesByCategory,
  validateExpense,
  debounce
} from '../utils';
import { Currency, Expense, ExpenseFilter, ExpenseCategory, PaymentMethod, Tag } from '../types';

// Mock date-fns functions for consistent testing
jest.mock('date-fns', () => ({
  format: jest.fn((date, pattern) => `formatted-${pattern}`),
  parseISO: jest.fn((dateString) => new Date(dateString)),
  isValid: jest.fn(() => true),
  startOfMonth: jest.fn(() => new Date('2024-01-01')),
  endOfMonth: jest.fn(() => new Date('2024-01-31')),
  startOfWeek: jest.fn(() => new Date('2024-01-07')),
  endOfWeek: jest.fn(() => new Date('2024-01-13'))
}));

describe('generateId', () => {
  it('should generate a unique string ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(typeof id1).toBe('string');
    expect(typeof id2).toBe('string');
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(0);
  });

  it('should generate IDs that are URL-safe', () => {
    const id = generateId();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});

describe('formatCurrency', () => {
  const mockCurrency: Currency = {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar'
  };

  beforeEach(() => {
    // Mock Intl.NumberFormat
    const mockFormat = jest.fn((value) => `$${value.toFixed(2)}`);
    global.Intl.NumberFormat = jest.fn().mockImplementation(() => ({
      format: mockFormat
    })) as any;
  });

  it('should format currency correctly', () => {
    const result = formatCurrency(123.45, mockCurrency);
    expect(result).toBe('$123.45');
    expect(Intl.NumberFormat).toHaveBeenCalledWith('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  });

  it('should handle zero amount', () => {
    const result = formatCurrency(0, mockCurrency);
    expect(result).toBe('$0.00');
  });

  it('should handle negative amounts', () => {
    const mockFormat = jest.fn((value) => `-$${Math.abs(value).toFixed(2)}`);
    global.Intl.NumberFormat = jest.fn().mockImplementation(() => ({
      format: mockFormat
    })) as any;

    const result = formatCurrency(-50.25, mockCurrency);
    expect(result).toBe('-$50.25');
  });
});

describe('formatDate', () => {
  const { format, parseISO, isValid } = require('date-fns');

  it('should format date with default pattern', () => {
    const date = new Date('2024-01-15');
    formatDate(date);
    
    expect(format).toHaveBeenCalledWith(date, 'MMM dd, yyyy');
  });

  it('should format date with custom pattern', () => {
    const date = new Date('2024-01-15');
    formatDate(date, 'yyyy-MM-dd');
    
    expect(format).toHaveBeenCalledWith(date, 'yyyy-MM-dd');
  });

  it('should parse ISO string dates', () => {
    const dateString = '2024-01-15T10:00:00Z';
    formatDate(dateString);
    
    expect(parseISO).toHaveBeenCalledWith(dateString);
  });

  it('should return empty string for invalid dates', () => {
    (isValid as jest.Mock).mockReturnValueOnce(false);
    const result = formatDate('invalid-date');
    expect(result).toBe('');
  });
});

describe('getCurrentMonth', () => {
  it('should return start and end of current month', () => {
    const result = getCurrentMonth();
    
    expect(result).toEqual({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    });
  });
});

describe('getCurrentWeek', () => {
  it('should return start and end of current week', () => {
    const result = getCurrentWeek();
    
    expect(result).toEqual({
      startDate: new Date('2024-01-07'),
      endDate: new Date('2024-01-13')
    });
  });
});

describe('filterExpenses', () => {
  const mockCategory: ExpenseCategory = {
    id: 'cat1',
    name: 'Food',
    color: '#FF0000',
    icon: '🍕'
  };

  const mockCurrency: Currency = {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar'
  };

  const mockPaymentMethod: PaymentMethod = {
    id: 'pm1',
    type: 'credit_card',
    name: 'Credit Card',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTag: Tag = {
    id: 'tag1',
    name: 'Business',
    createdAt: new Date()
  };

  const expenses: Expense[] = [
    {
      id: '1',
      amount: 25.50,
      description: 'Lunch at restaurant',
      vendor: 'Pizza Place',
      category: mockCategory,
      date: new Date('2024-01-15'),
      currency: mockCurrency,
      paymentMethod: mockPaymentMethod,
      tags: [mockTag],
      location: 'Downtown',
      notes: 'Team lunch',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      amount: 100.00,
      description: 'Groceries',
      vendor: 'Supermarket',
      category: { ...mockCategory, id: 'cat2' },
      date: new Date('2024-01-10'),
      currency: mockCurrency,
      paymentMethod: mockPaymentMethod,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  it('should return all expenses when no filter is applied', () => {
    const result = filterExpenses(expenses, {});
    expect(result).toEqual(expenses);
  });

  it('should filter by category', () => {
    const filter: ExpenseFilter = {
      categories: ['cat1']
    };
    const result = filterExpenses(expenses, filter);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should filter by date range', () => {
    const filter: ExpenseFilter = {
      dateRange: {
        startDate: new Date('2024-01-14'),
        endDate: new Date('2024-01-16')
      }
    };
    const result = filterExpenses(expenses, filter);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should filter by amount range', () => {
    const filter: ExpenseFilter = {
      minAmount: 50,
      maxAmount: 200
    };
    const result = filterExpenses(expenses, filter);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should filter by search text', () => {
    const filter: ExpenseFilter = {
      searchText: 'lunch'
    };
    const result = filterExpenses(expenses, filter);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should return empty array for empty input', () => {
    const result = filterExpenses([], {});
    expect(result).toEqual([]);
  });

  it('should handle null/undefined expenses', () => {
    const result = filterExpenses(null as any, {});
    expect(result).toEqual([]);
  });
});

describe('calculateTotal', () => {
  const expenses: Expense[] = [
    { amount: 25.50 } as Expense,
    { amount: 100.00 } as Expense,
    { amount: 15.75 } as Expense
  ];

  it('should calculate total of expenses', () => {
    const result = calculateTotal(expenses);
    expect(result).toBe(141.25);
  });

  it('should return 0 for empty array', () => {
    const result = calculateTotal([]);
    expect(result).toBe(0);
  });

  it('should handle null/undefined expenses', () => {
    const result = calculateTotal(null as any);
    expect(result).toBe(0);
  });

  it('should handle single expense', () => {
    const result = calculateTotal([{ amount: 42.00 } as Expense]);
    expect(result).toBe(42.00);
  });
});

describe('groupExpensesByCategory', () => {
  const mockCategory1: ExpenseCategory = {
    id: 'cat1',
    name: 'Food',
    color: '#FF0000',
    icon: '🍕'
  };

  const mockCategory2: ExpenseCategory = {
    id: 'cat2',
    name: 'Transport',
    color: '#00FF00',
    icon: '🚗'
  };

  const expenses: Expense[] = [
    { id: '1', category: mockCategory1 } as Expense,
    { id: '2', category: mockCategory1 } as Expense,
    { id: '3', category: mockCategory2 } as Expense
  ];

  it('should group expenses by category', () => {
    const result = groupExpensesByCategory(expenses);
    
    expect(result).toHaveProperty('cat1');
    expect(result).toHaveProperty('cat2');
    expect(result.cat1).toHaveLength(2);
    expect(result.cat2).toHaveLength(1);
    expect(result.cat1[0].id).toBe('1');
    expect(result.cat1[1].id).toBe('2');
    expect(result.cat2[0].id).toBe('3');
  });

  it('should return empty object for empty array', () => {
    const result = groupExpensesByCategory([]);
    expect(result).toEqual({});
  });

  it('should handle null/undefined expenses', () => {
    const result = groupExpensesByCategory(null as any);
    expect(result).toEqual({});
  });
});

describe('validateExpense', () => {
  const validExpense: Partial<Expense> = {
    vendor: 'Test Vendor',
    amount: 25.50,
    category: { id: 'cat1' } as ExpenseCategory,
    paymentMethod: { id: 'pm1' } as PaymentMethod,
    date: new Date(),
    currency: { code: 'USD' } as Currency
  };

  it('should return no errors for valid expense', () => {
    const errors = validateExpense(validExpense);
    expect(errors).toEqual([]);
  });

  it('should return error for missing vendor', () => {
    const expense = { ...validExpense, vendor: '' };
    const errors = validateExpense(expense);
    expect(errors).toContain('Vendor is required');
  });

  it('should return error for invalid amount', () => {
    const expense = { ...validExpense, amount: 0 };
    const errors = validateExpense(expense);
    expect(errors).toContain('Amount must be greater than 0');
  });

  it('should return error for missing category', () => {
    const expense = { ...validExpense, category: undefined };
    const errors = validateExpense(expense);
    expect(errors).toContain('Category is required');
  });

  it('should return error for missing payment method', () => {
    const expense = { ...validExpense, paymentMethod: undefined };
    const errors = validateExpense(expense);
    expect(errors).toContain('Payment method is required');
  });

  it('should return error for missing date', () => {
    const expense = { ...validExpense, date: undefined };
    const errors = validateExpense(expense);
    expect(errors).toContain('Date is required');
  });

  it('should return error for missing currency', () => {
    const expense = { ...validExpense, currency: undefined };
    const errors = validateExpense(expense);
    expect(errors).toContain('Currency is required');
  });

  it('should return multiple errors for multiple missing fields', () => {
    const expense = {
      vendor: '',
      amount: -10
    };
    const errors = validateExpense(expense);
    expect(errors.length).toBeGreaterThan(1);
    expect(errors).toContain('Vendor is required');
    expect(errors).toContain('Amount must be greater than 0');
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  it('should delay function execution', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('test');
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should cancel previous calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    debouncedFn('second');
    
    jest.advanceTimersByTime(100);
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('second');
  });

  it('should handle multiple arguments', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('arg1', 'arg2', 'arg3');
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });
});