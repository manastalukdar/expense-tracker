import { Currency, ExpenseCategory, PaymentMethodTemplate } from './types';

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

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [];

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

export const DEFAULT_PAYMENT_METHOD_TEMPLATES: PaymentMethodTemplate[] = [
  { type: 'cash', name: 'Cash', icon: '💵', color: '#00B894' },
  { type: 'credit_card', name: 'Credit Card', icon: '💳', color: '#0984e3' },
  { type: 'debit_card', name: 'Debit Card', icon: '💳', color: '#6c5ce7' },
  { type: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', color: '#fd79a8' },
  { type: 'digital_wallet', name: 'Digital Wallet', icon: '📱', color: '#e17055' },
  { type: 'other', name: 'Other', icon: '💰', color: '#636e72' },
];

export const CARD_NETWORK_ICONS = {
  visa: '🔵',
  mastercard: '🔴', 
  amex: '🟢',
  discover: '🟠',
  other: '💳',
};

export const POPULAR_CARD_NETWORKS = [
  { value: 'visa', label: 'Visa', icon: '🔵' },
  { value: 'mastercard', label: 'Mastercard', icon: '🔴' },
  { value: 'amex', label: 'American Express', icon: '🟢' },
  { value: 'discover', label: 'Discover', icon: '🟠' },
  { value: 'other', label: 'Other', icon: '💳' },
];

export const DEFAULT_TAG_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#FAB1A0', '#74B9FF', '#A29BFE', '#6C5CE7',
];

export const CATEGORY_MANAGEMENT = {
  MAX_DEPTH: 3, // Maximum nesting level
  DEFAULT_COLORS: CHART_COLORS,
  COMMON_ICONS: [
    '🍽️', '🛒', '🚗', '💡', '🎬', '🏥', '🛍️', '📚', '✈️', '🏠',
    '🛡️', '🎁', '💪', '💅', '💼', '📄', '🎯', '🎨', '🎵', '🔧',
  ],
};

export const PAYMENT_METHOD_MANAGEMENT = {
  MAX_ALIAS_LENGTH: 50,
  MAX_NAME_LENGTH: 100,
  DEFAULT_COLORS: [
    '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6',
    '#AF52DE', '#FF2D92', '#FF6961', '#32D74B', '#007AFF',
  ],
};

export const TAG_MANAGEMENT = {
  MAX_NAME_LENGTH: 30,
  MAX_SUGGESTIONS: 10,
  MIN_RELEVANCE_SCORE: 0.3,
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