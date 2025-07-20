import SQLite from 'react-native-sqlite-storage';
import { 
  Expense, 
  ExpenseCategory, 
  Currency, 
  Budget, 
  UserPreferences,
  ExpenseFilter,
  generateId 
} from '@expense-tracker/shared';
import { CREATE_TABLES_SQL, CREATE_INDEXES_SQL, INSERT_DEFAULT_DATA_SQL } from './schema';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      console.log('🗄️ Opening SQLite database...');
      this.db = await SQLite.openDatabase({
        name: 'ExpenseTracker.db',
        location: 'default',
        // Remove createFromLocation as it might cause issues
      });
      console.log('✅ Database opened successfully');

      console.log('🏗️ Creating tables...');
      await this.createTables();
      console.log('✅ Tables created');
      
      console.log('📇 Creating indexes...');
      await this.createIndexes();
      console.log('✅ Indexes created');
      
      console.log('📋 Inserting default data...');
      await this.insertDefaultData();
      console.log('✅ Default data inserted');
      
      console.log('🎉 Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      console.error('Database error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    try {
      await this.db.executeSql(CREATE_TABLES_SQL);
    } catch (error) {
      console.error('❌ Failed to create tables:', error);
      throw new Error(`Table creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    try {
      await this.db.executeSql(CREATE_INDEXES_SQL);
    } catch (error) {
      console.error('❌ Failed to create indexes:', error);
      throw new Error(`Index creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async insertDefaultData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    try {
      await this.db.executeSql(INSERT_DEFAULT_DATA_SQL);
    } catch (error) {
      console.error('❌ Failed to insert default data:', error);
      throw new Error(`Default data insertion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  // Expense operations
  public async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = generateId();
    const now = new Date().toISOString();

    await this.db.executeSql(`
      INSERT INTO expenses (id, amount, description, category_id, date, currency_code, location, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      expense.amount,
      expense.description,
      expense.category.id,
      expense.date.toISOString(),
      expense.currency.code,
      expense.location || null,
      expense.notes || null,
      now,
      now
    ]);

    // Handle tags
    if (expense.tags && expense.tags.length > 0) {
      await this.addTagsToExpense(id, expense.tags);
    }

    return id;
  }

  public async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updates.amount);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.category !== undefined) {
      fields.push('category_id = ?');
      values.push(updates.category.id);
    }
    if (updates.date !== undefined) {
      fields.push('date = ?');
      values.push(updates.date.toISOString());
    }
    if (updates.currency !== undefined) {
      fields.push('currency_code = ?');
      values.push(updates.currency.code);
    }
    if (updates.location !== undefined) {
      fields.push('location = ?');
      values.push(updates.location);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db.executeSql(`
      UPDATE expenses SET ${fields.join(', ')} WHERE id = ?
    `, values);

    // Handle tags update
    if (updates.tags !== undefined) {
      await this.db.executeSql('DELETE FROM expense_tags WHERE expense_id = ?', [id]);
      if (updates.tags.length > 0) {
        await this.addTagsToExpense(id, updates.tags);
      }
    }
  }

  public async deleteExpense(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql('DELETE FROM expenses WHERE id = ?', [id]);
  }

  public async getExpenses(filter?: ExpenseFilter, limit?: number, offset?: number): Promise<Expense[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT 
        e.id, e.amount, e.description, e.date, e.location, e.notes, e.created_at, e.updated_at,
        c.id as category_id, c.name as category_name, c.color as category_color, c.icon as category_icon,
        cur.code as currency_code, cur.symbol as currency_symbol, cur.name as currency_name
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      JOIN currencies cur ON e.currency_code = cur.code
    `;

    const conditions: string[] = [];
    const values: any[] = [];

    if (filter) {
      if (filter.categories && filter.categories.length > 0) {
        conditions.push(`e.category_id IN (${filter.categories.map(() => '?').join(', ')})`);
        values.push(...filter.categories);
      }
      if (filter.dateRange) {
        conditions.push('e.date >= ? AND e.date <= ?');
        values.push(filter.dateRange.startDate.toISOString(), filter.dateRange.endDate.toISOString());
      }
      if (filter.minAmount !== undefined) {
        conditions.push('e.amount >= ?');
        values.push(filter.minAmount);
      }
      if (filter.maxAmount !== undefined) {
        conditions.push('e.amount <= ?');
        values.push(filter.maxAmount);
      }
      if (filter.searchText) {
        conditions.push('(e.description LIKE ? OR e.notes LIKE ?)');
        const searchPattern = `%${filter.searchText}%`;
        values.push(searchPattern, searchPattern);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY e.date DESC';

    if (limit) {
      query += ' LIMIT ?';
      values.push(limit);
      if (offset) {
        query += ' OFFSET ?';
        values.push(offset);
      }
    }

    const [results] = await this.db.executeSql(query, values);
    const expenses: Expense[] = [];

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      const expense: Expense = {
        id: row.id,
        amount: row.amount,
        description: row.description,
        category: {
          id: row.category_id,
          name: row.category_name,
          color: row.category_color,
          icon: row.category_icon,
        },
        date: new Date(row.date),
        currency: {
          code: row.currency_code,
          symbol: row.currency_symbol,
          name: row.currency_name,
        },
        location: row.location,
        notes: row.notes,
        tags: await this.getExpenseTags(row.id),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
      expenses.push(expense);
    }

    return expenses;
  }

  public async getExpenseById(id: string): Promise<Expense | null> {
    const expenses = await this.getExpenses();
    return expenses.find(e => e.id === id) || null;
  }

  // Category operations
  public async getCategories(): Promise<ExpenseCategory[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT id, name, color, icon, parent_id FROM categories ORDER BY name
    `);

    const categories: ExpenseCategory[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      categories.push({
        id: row.id,
        name: row.name,
        color: row.color,
        icon: row.icon,
        parentId: row.parent_id,
      });
    }

    return categories;
  }

  public async createCategory(category: Omit<ExpenseCategory, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = generateId();
    await this.db.executeSql(`
      INSERT INTO categories (id, name, color, icon, parent_id)
      VALUES (?, ?, ?, ?, ?)
    `, [id, category.name, category.color, category.icon, category.parentId || null]);

    return id;
  }

  // Currency operations
  public async getCurrencies(): Promise<Currency[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT code, symbol, name FROM currencies ORDER BY name
    `);

    const currencies: Currency[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      currencies.push({
        code: row.code,
        symbol: row.symbol,
        name: row.name,
      });
    }

    return currencies;
  }

  // Tag operations
  private async addTagsToExpense(expenseId: string, tags: string[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const tagName of tags) {
      // Create tag if it doesn't exist
      const tagId = generateId();
      await this.db.executeSql(`
        INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)
      `, [tagId, tagName]);

      // Get the tag ID
      const [tagResults] = await this.db.executeSql(`
        SELECT id FROM tags WHERE name = ?
      `, [tagName]);

      if (tagResults.rows.length > 0) {
        const actualTagId = tagResults.rows.item(0).id;
        // Link expense to tag
        await this.db.executeSql(`
          INSERT OR IGNORE INTO expense_tags (expense_id, tag_id) VALUES (?, ?)
        `, [expenseId, actualTagId]);
      }
    }
  }

  private async getExpenseTags(expenseId: string): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT t.name FROM tags t
      JOIN expense_tags et ON t.id = et.tag_id
      WHERE et.expense_id = ?
    `, [expenseId]);

    const tags: string[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      tags.push(results.rows.item(i).name);
    }

    return tags;
  }

  // User preferences operations
  public async getUserPreferences(): Promise<UserPreferences> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT 
        up.default_currency_code, up.theme, up.language, up.date_format, up.first_day_of_week,
        c.symbol as currency_symbol, c.name as currency_name
      FROM user_preferences up
      JOIN currencies c ON up.default_currency_code = c.code
      WHERE up.id = 1
    `);

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return {
        defaultCurrency: {
          code: row.default_currency_code,
          symbol: row.currency_symbol,
          name: row.currency_name,
        },
        theme: row.theme,
        language: row.language,
        dateFormat: row.date_format,
        firstDayOfWeek: row.first_day_of_week,
      };
    }

    throw new Error('User preferences not found');
  }

  public async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    if (preferences.defaultCurrency) {
      fields.push('default_currency_code = ?');
      values.push(preferences.defaultCurrency.code);
    }
    if (preferences.theme) {
      fields.push('theme = ?');
      values.push(preferences.theme);
    }
    if (preferences.language) {
      fields.push('language = ?');
      values.push(preferences.language);
    }
    if (preferences.dateFormat) {
      fields.push('date_format = ?');
      values.push(preferences.dateFormat);
    }
    if (preferences.firstDayOfWeek !== undefined) {
      fields.push('first_day_of_week = ?');
      values.push(preferences.firstDayOfWeek);
    }

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(1);

      await this.db.executeSql(`
        UPDATE user_preferences SET ${fields.join(', ')} WHERE id = ?
      `, values);
    }
  }
}