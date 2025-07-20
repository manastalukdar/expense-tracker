export const CREATE_TABLES_SQL = `
  -- Categories table
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    parent_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
  );

  -- Currencies table
  CREATE TABLE IF NOT EXISTS currencies (
    code TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL
  );

  -- Payment methods table
  CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other')),
    name TEXT NOT NULL,
    alias TEXT,
    last_four_digits TEXT,
    card_network TEXT CHECK (card_network IN ('visa', 'mastercard', 'amex', 'discover', 'other')),
    bank_name TEXT,
    provider TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    color TEXT DEFAULT '#007AFF',
    icon TEXT DEFAULT '💳',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Expenses table
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    category_id TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    currency_code TEXT NOT NULL,
    payment_method_id TEXT,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (currency_code) REFERENCES currencies(code),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
  );

  -- Tags table
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Expense tags junction table
  CREATE TABLE IF NOT EXISTS expense_tags (
    expense_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (expense_id, tag_id),
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );

  -- Budgets table
  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    currency_code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (currency_code) REFERENCES currencies(code)
  );

  -- Budget categories junction table
  CREATE TABLE IF NOT EXISTS budget_categories (
    budget_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    PRIMARY KEY (budget_id, category_id),
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  -- User preferences table
  CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    default_currency_code TEXT NOT NULL DEFAULT 'USD',
    theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT NOT NULL DEFAULT 'en',
    date_format TEXT NOT NULL DEFAULT 'MMM dd, yyyy',
    first_day_of_week INTEGER NOT NULL DEFAULT 0 CHECK (first_day_of_week >= 0 AND first_day_of_week <= 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (default_currency_code) REFERENCES currencies(code)
  );
`;

export const CREATE_INDEXES_SQL = `
  -- Performance indexes
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
  CREATE INDEX IF NOT EXISTS idx_expenses_currency ON expenses(currency_code);
  CREATE INDEX IF NOT EXISTS idx_expenses_payment_method ON expenses(payment_method_id);
  CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);
  CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
  CREATE INDEX IF NOT EXISTS idx_expense_tags_expense ON expense_tags(expense_id);
  CREATE INDEX IF NOT EXISTS idx_expense_tags_tag ON expense_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
  CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active);
  CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
`;

export const INSERT_DEFAULT_DATA_SQL = `
  -- Insert default currencies
  INSERT OR IGNORE INTO currencies (code, symbol, name) VALUES
    ('USD', '$', 'US Dollar'),
    ('EUR', '€', 'Euro'),
    ('GBP', '£', 'British Pound'),
    ('JPY', '¥', 'Japanese Yen'),
    ('CAD', 'C$', 'Canadian Dollar'),
    ('AUD', 'A$', 'Australian Dollar'),
    ('CHF', 'CHF', 'Swiss Franc'),
    ('CNY', '¥', 'Chinese Yuan'),
    ('INR', '₹', 'Indian Rupee');

  -- Insert default categories
  INSERT OR IGNORE INTO categories (id, name, color, icon) VALUES
    ('food', 'Food & Dining', '#FF6B6B', '🍽️'),
    ('groceries', 'Groceries', '#4ECDC4', '🛒'),
    ('transportation', 'Transportation', '#45B7D1', '🚗'),
    ('utilities', 'Utilities', '#96CEB4', '💡'),
    ('entertainment', 'Entertainment', '#FFEAA7', '🎬'),
    ('healthcare', 'Healthcare', '#DDA0DD', '🏥'),
    ('shopping', 'Shopping', '#FAB1A0', '🛍️'),
    ('education', 'Education', '#74B9FF', '📚'),
    ('travel', 'Travel', '#A29BFE', '✈️'),
    ('housing', 'Housing & Rent', '#6C5CE7', '🏠'),
    ('insurance', 'Insurance', '#FD79A8', '🛡️'),
    ('gifts', 'Gifts & Donations', '#FDCB6E', '🎁'),
    ('fitness', 'Fitness & Sports', '#00B894', '💪'),
    ('personal-care', 'Personal Care', '#E17055', '💅'),
    ('business', 'Business', '#2D3436', '💼'),
    ('other', 'Other', '#636E72', '📄');

  -- Insert default payment methods
  INSERT OR IGNORE INTO payment_methods (id, type, name, icon, color, is_default) VALUES
    ('cash', 'cash', 'Cash', '💵', '#00B894', TRUE);

  -- Insert default user preferences
  INSERT OR IGNORE INTO user_preferences (id) VALUES (1);
`;