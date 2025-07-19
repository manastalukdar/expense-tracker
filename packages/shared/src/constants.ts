import { Currency, ExpenseCategory } from './types';

export const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'food', name: 'Food & Dining', color: '#FF6B6B', icon: '🍽️' },
  { id: 'groceries', name: 'Groceries', color: '#4ECDC4', icon: '🛒' },
  { id: 'transportation', name: 'Transportation', color: '#45B7D1', icon: '🚗' },
  { id: 'utilities', name: 'Utilities', color: '#96CEB4', icon: '💡' },
  { id: 'entertainment', name: 'Entertainment', color: '#FFEAA7', icon: '🎬' },
  { id: 'healthcare', name: 'Healthcare', color: '#DDA0DD', icon: '🏥' },
  { id: 'shopping', name: 'Shopping', color: '#FAB1A0', icon: '🛍️' },
  { id: 'education', name: 'Education', color: '#74B9FF', icon: '📚' },
  { id: 'travel', name: 'Travel', color: '#A29BFE', icon: '✈️' },
  { id: 'housing', name: 'Housing & Rent', color: '#6C5CE7', icon: '🏠' },
  { id: 'insurance', name: 'Insurance', color: '#FD79A8', icon: '🛡️' },
  { id: 'gifts', name: 'Gifts & Donations', color: '#FDCB6E', icon: '🎁' },
  { id: 'fitness', name: 'Fitness & Sports', color: '#00B894', icon: '💪' },
  { id: 'personal-care', name: 'Personal Care', color: '#E17055', icon: '💅' },
  { id: 'business', name: 'Business', color: '#2D3436', icon: '💼' },
  { id: 'other', name: 'Other', color: '#636E72', icon: '📄' },
];

export const DATE_FORMATS = {
  SHORT: 'MMM dd',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'MMM dd, yyyy HH:mm',
};

export const CHART_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#FAB1A0', '#74B9FF', '#A29BFE', '#6C5CE7',
  '#FD79A8', '#FDCB6E', '#00B894', '#E17055', '#2D3436',
];

export const APP_CONSTANTS = {
  MAX_EXPENSE_AMOUNT: 1000000,
  MIN_EXPENSE_AMOUNT: 0.01,
  MAX_DESCRIPTION_LENGTH: 255,
  MAX_NOTES_LENGTH: 1000,
  MAX_TAGS: 10,
  DEFAULT_CURRENCY_CODE: 'USD',
  DEFAULT_DATE_FORMAT: DATE_FORMATS.MEDIUM,
  ITEMS_PER_PAGE: 20,
  SEARCH_DEBOUNCE_MS: 300,
};

export const EXPENSE_VALIDATION_RULES = {
  DESCRIPTION: {
    MIN_LENGTH: 1,
    MAX_LENGTH: APP_CONSTANTS.MAX_DESCRIPTION_LENGTH,
  },
  AMOUNT: {
    MIN: APP_CONSTANTS.MIN_EXPENSE_AMOUNT,
    MAX: APP_CONSTANTS.MAX_EXPENSE_AMOUNT,
  },
  NOTES: {
    MAX_LENGTH: APP_CONSTANTS.MAX_NOTES_LENGTH,
  },
  TAGS: {
    MAX_COUNT: APP_CONSTANTS.MAX_TAGS,
    MAX_LENGTH: 50,
  },
};

export const THEME_COLORS = {
  LIGHT: {
    PRIMARY: '#007AFF',
    SECONDARY: '#5856D6',
    BACKGROUND: '#FFFFFF',
    SURFACE: '#F2F2F7',
    TEXT: '#000000',
    TEXT_SECONDARY: '#8E8E93',
    BORDER: '#C7C7CC',
    SUCCESS: '#34C759',
    WARNING: '#FF9500',
    ERROR: '#FF3B30',
  },
  DARK: {
    PRIMARY: '#0A84FF',
    SECONDARY: '#5E5CE6',
    BACKGROUND: '#000000',
    SURFACE: '#1C1C1E',
    TEXT: '#FFFFFF',
    TEXT_SECONDARY: '#8E8E93',
    BORDER: '#38383A',
    SUCCESS: '#30D158',
    WARNING: '#FF9F0A',
    ERROR: '#FF453A',
  },
};