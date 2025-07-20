import SQLite from 'react-native-sqlite-storage';
import { 
  Expense, 
  ExpenseCategory, 
  Currency, 
  Budget, 
  UserPreferences,
  ExpenseFilter,
  PaymentMethod,
  Tag,
  Vendor,
  CategoryTree,
  PaymentMethodFormData,
  TagFormData,
  CategoryFormData,
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

    // Create or update vendor usage
    await this.createOrUpdateVendor(expense.vendor);

    await this.db.executeSql(`
      INSERT INTO expenses (id, amount, description, vendor, category_id, date, currency_code, payment_method_id, location, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      expense.amount,
      expense.description || null,
      expense.vendor,
      expense.category.id,
      expense.date.toISOString(),
      expense.currency.code,
      expense.paymentMethod?.id || null,
      expense.location || null,
      expense.notes || null,
      now,
      now
    ]);

    // Handle tags
    if (expense.tags && expense.tags.length > 0) {
      await this.addTagsToExpense(id, expense.tags.map(tag => tag.id));
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
    if (updates.vendor !== undefined) {
      fields.push('vendor = ?');
      values.push(updates.vendor);
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
        await this.addTagsToExpense(id, updates.tags.map(tag => tag.id));
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
        e.id, e.amount, e.description, e.vendor, e.date, e.location, e.notes, e.created_at, e.updated_at,
        c.id as category_id, c.name as category_name, c.color as category_color, c.icon as category_icon,
        cur.code as currency_code, cur.symbol as currency_symbol, cur.name as currency_name,
        pm.id as payment_method_id, pm.name as payment_method_name, pm.type as payment_method_type
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      JOIN currencies cur ON e.currency_code = cur.code
      LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
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
        conditions.push('(e.description LIKE ? OR e.vendor LIKE ? OR e.notes LIKE ?)');
        const searchPattern = `%${filter.searchText}%`;
        values.push(searchPattern, searchPattern, searchPattern);
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
        vendor: row.vendor,
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
        paymentMethod: row.payment_method_id ? {
          id: row.payment_method_id,
          name: row.payment_method_name,
          type: row.payment_method_type,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } : undefined,
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
  private async addTagsToExpense(expenseId: string, tagIds: string[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const tagId of tagIds) {
      await this.db.executeSql(`
        INSERT OR IGNORE INTO expense_tags (expense_id, tag_id) VALUES (?, ?)
      `, [expenseId, tagId]);
    }
  }

  private async getExpenseTags(expenseId: string): Promise<Tag[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT t.id, t.name, t.color, t.description, t.created_at FROM tags t
      JOIN expense_tags et ON t.id = et.tag_id
      WHERE et.expense_id = ?
    `, [expenseId]);

    const tags: Tag[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      tags.push({
        id: row.id,
        name: row.name,
        color: row.color,
        description: row.description,
        createdAt: new Date(row.created_at),
      });
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

  // Payment Method operations
  public async getPaymentMethods(): Promise<PaymentMethod[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY is_default DESC, name ASC
    `);

    const paymentMethods: PaymentMethod[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      paymentMethods.push({
        id: row.id,
        type: row.type,
        name: row.name,
        alias: row.alias,
        lastFourDigits: row.last_four_digits,
        cardNetwork: row.card_network,
        bankName: row.bank_name,
        provider: row.provider,
        isDefault: Boolean(row.is_default),
        isActive: Boolean(row.is_active),
        color: row.color,
        icon: row.icon,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });
    }

    return paymentMethods;
  }

  public async getPaymentMethodById(id: string): Promise<PaymentMethod | null> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT * FROM payment_methods WHERE id = ?
    `, [id]);

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return {
        id: row.id,
        type: row.type,
        name: row.name,
        alias: row.alias,
        lastFourDigits: row.last_four_digits,
        cardNetwork: row.card_network,
        bankName: row.bank_name,
        provider: row.provider,
        isDefault: Boolean(row.is_default),
        isActive: Boolean(row.is_active),
        color: row.color,
        icon: row.icon,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    }

    return null;
  }

  public async createPaymentMethod(data: PaymentMethodFormData): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = generateId();
    const now = new Date().toISOString();

    // If this is set as default, remove default from others
    if (data.isDefault) {
      await this.db.executeSql(`
        UPDATE payment_methods SET is_default = 0, updated_at = ?
      `, [now]);
    }

    await this.db.executeSql(`
      INSERT INTO payment_methods (
        id, type, name, alias, last_four_digits, card_network, bank_name, 
        provider, is_default, color, icon, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, data.type, data.name, data.alias || null, data.lastFourDigits || null,
      data.cardNetwork || null, data.bankName || null, data.provider || null,
      data.isDefault ? 1 : 0, data.color || '#007AFF', data.icon || '💳',
      now, now
    ]);

    return id;
  }

  public async updatePaymentMethod(id: string, data: Partial<PaymentMethodFormData>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    // If this is set as default, remove default from others
    if (data.isDefault) {
      await this.db.executeSql(`
        UPDATE payment_methods SET is_default = 0, updated_at = ?
      `, [new Date().toISOString()]);
    }

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        switch (key) {
          case 'type':
            fields.push('type = ?');
            values.push(value);
            break;
          case 'name':
            fields.push('name = ?');
            values.push(value);
            break;
          case 'alias':
            fields.push('alias = ?');
            values.push(value || null);
            break;
          case 'lastFourDigits':
            fields.push('last_four_digits = ?');
            values.push(value || null);
            break;
          case 'cardNetwork':
            fields.push('card_network = ?');
            values.push(value || null);
            break;
          case 'bankName':
            fields.push('bank_name = ?');
            values.push(value || null);
            break;
          case 'provider':
            fields.push('provider = ?');
            values.push(value || null);
            break;
          case 'isDefault':
            fields.push('is_default = ?');
            values.push(value ? 1 : 0);
            break;
          case 'color':
            fields.push('color = ?');
            values.push(value);
            break;
          case 'icon':
            fields.push('icon = ?');
            values.push(value);
            break;
        }
      }
    });

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      await this.db.executeSql(`
        UPDATE payment_methods SET ${fields.join(', ')} WHERE id = ?
      `, values);
    }
  }

  public async deletePaymentMethod(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Soft delete by setting is_active to false
    await this.db.executeSql(`
      UPDATE payment_methods SET is_active = 0, updated_at = ? WHERE id = ?
    `, [new Date().toISOString(), id]);
  }

  // Enhanced Category operations
  public async getCategoryTree(): Promise<CategoryTree[]> {
    const categories = await this.getCategories();
    return this.buildCategoryTree(categories);
  }

  private buildCategoryTree(categories: ExpenseCategory[], parentId?: string, depth = 0): CategoryTree[] {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(category => ({
        category: { ...category, level: depth },
        children: this.buildCategoryTree(categories, category.id, depth + 1),
        depth,
      }));
  }

  public async createCategory(data: CategoryFormData): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = generateId();
    const now = new Date().toISOString();

    await this.db.executeSql(`
      INSERT INTO categories (id, name, color, icon, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, data.name, data.color, data.icon, data.parentId || null, now, now]);

    return id;
  }

  public async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        switch (key) {
          case 'name':
            fields.push('name = ?');
            values.push(value);
            break;
          case 'color':
            fields.push('color = ?');
            values.push(value);
            break;
          case 'icon':
            fields.push('icon = ?');
            values.push(value);
            break;
          case 'parentId':
            fields.push('parent_id = ?');
            values.push(value || null);
            break;
        }
      }
    });

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      await this.db.executeSql(`
        UPDATE categories SET ${fields.join(', ')} WHERE id = ?
      `, values);
    }
  }

  public async deleteCategory(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if category has children
    const [childResults] = await this.db.executeSql(`
      SELECT COUNT(*) as count FROM categories WHERE parent_id = ?
    `, [id]);

    if (childResults.rows.item(0).count > 0) {
      throw new Error('Cannot delete category with child categories');
    }

    // Check if category is used in expenses
    const [expenseResults] = await this.db.executeSql(`
      SELECT COUNT(*) as count FROM expenses WHERE category_id = ?
    `, [id]);

    if (expenseResults.rows.item(0).count > 0) {
      throw new Error('Cannot delete category that is used in expenses');
    }

    await this.db.executeSql(`DELETE FROM categories WHERE id = ?`, [id]);
  }

  public async moveCategoryToParent(categoryId: string, newParentId?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Prevent circular references
    if (newParentId && await this.isDescendantOf(newParentId, categoryId)) {
      throw new Error('Cannot move category to its own descendant');
    }

    await this.db.executeSql(`
      UPDATE categories SET parent_id = ?, updated_at = ? WHERE id = ?
    `, [newParentId || null, new Date().toISOString(), categoryId]);
  }

  private async isDescendantOf(candidateId: string, ancestorId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      WITH RECURSIVE category_descendants AS (
        SELECT id, parent_id FROM categories WHERE id = ?
        UNION ALL
        SELECT c.id, c.parent_id FROM categories c
        INNER JOIN category_descendants cd ON c.parent_id = cd.id
      )
      SELECT id FROM category_descendants WHERE id = ?
    `, [candidateId, ancestorId]);

    return results.rows.length > 0;
  }

  // Tag operations
  public async getTags(): Promise<Tag[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT t.*, COUNT(et.tag_id) as usage_count
      FROM tags t
      LEFT JOIN expense_tags et ON t.id = et.tag_id
      GROUP BY t.id, t.name, t.created_at
      ORDER BY usage_count DESC, t.name ASC
    `);

    const tags: Tag[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      tags.push({
        id: row.id,
        name: row.name,
        color: row.color,
        usageCount: row.usage_count,
        createdAt: new Date(row.created_at),
      });
    }

    return tags;
  }

  public async createTag(data: TagFormData): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = generateId();
    const now = new Date().toISOString();

    await this.db.executeSql(`
      INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)
    `, [id, data.name, data.color || null, now]);

    return id;
  }

  public async updateTag(id: string, data: Partial<TagFormData>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.color !== undefined) {
      fields.push('color = ?');
      values.push(data.color);
    }

    if (fields.length > 0) {
      values.push(id);
      await this.db.executeSql(`
        UPDATE tags SET ${fields.join(', ')} WHERE id = ?
      `, values);
    }
  }

  public async deleteTag(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Delete tag and all its associations
    await this.db.executeSql(`DELETE FROM expense_tags WHERE tag_id = ?`, [id]);
    await this.db.executeSql(`DELETE FROM tags WHERE id = ?`, [id]);
  }

  public async getOrCreateTag(name: string): Promise<Tag> {
    if (!this.db) throw new Error('Database not initialized');

    // Try to find existing tag
    const [results] = await this.db.executeSql(`
      SELECT * FROM tags WHERE LOWER(name) = LOWER(?)
    `, [name]);

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return {
        id: row.id,
        name: row.name,
        color: row.color,
        usageCount: 0, // We don't need usage count here
        createdAt: new Date(row.created_at),
      };
    }

    // Create new tag
    const id = await this.createTag({ name });
    return {
      id,
      name,
      createdAt: new Date(),
    };
  }

  public async searchTags(query: string): Promise<Tag[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT t.*, COUNT(et.tag_id) as usage_count
      FROM tags t
      LEFT JOIN expense_tags et ON t.id = et.tag_id
      WHERE t.name LIKE ?
      GROUP BY t.id, t.name, t.created_at
      ORDER BY usage_count DESC, t.name ASC
      LIMIT 20
    `, [`%${query}%`]);

    const tags: Tag[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      tags.push({
        id: row.id,
        name: row.name,
        color: row.color,
        usageCount: row.usage_count,
        createdAt: new Date(row.created_at),
      });
    }

    return tags;
  }

  // Vendor operations
  public async createOrUpdateVendor(vendorName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    
    // Check if vendor exists
    const [result] = await this.db.executeSql(
      'SELECT id, usage_count FROM vendors WHERE name = ?',
      [vendorName]
    );

    if (result.rows.length > 0) {
      // Update existing vendor
      const vendorId = result.rows.item(0).id;
      const currentUsage = result.rows.item(0).usage_count;
      
      await this.db.executeSql(`
        UPDATE vendors 
        SET usage_count = ?, last_used = ?
        WHERE id = ?
      `, [currentUsage + 1, now, vendorId]);
    } else {
      // Create new vendor
      const id = generateId();
      await this.db.executeSql(`
        INSERT INTO vendors (id, name, usage_count, last_used, created_at)
        VALUES (?, ?, ?, ?, ?)
      `, [id, vendorName, 1, now, now]);
    }
  }

  public async searchVendors(query: string, limit: number = 10): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT name FROM vendors 
      WHERE name LIKE ? 
      ORDER BY usage_count DESC, last_used DESC
      LIMIT ?
    `, [`%${query}%`, limit]);

    const vendors: string[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      vendors.push(results.rows.item(i).name);
    }

    return vendors;
  }

  public async getPopularVendors(limit: number = 10): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT name FROM vendors 
      ORDER BY usage_count DESC, last_used DESC
      LIMIT ?
    `, [limit]);

    const vendors: string[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      vendors.push(results.rows.item(i).name);
    }

    return vendors;
  }

  public async getAllVendors(): Promise<Vendor[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql(`
      SELECT id, name, usage_count, last_used, created_at FROM vendors 
      ORDER BY usage_count DESC, name ASC
    `);

    const vendors: Vendor[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      vendors.push({
        id: row.id,
        name: row.name,
        usageCount: row.usage_count,
        lastUsed: new Date(row.last_used),
        createdAt: new Date(row.created_at),
      });
    }

    return vendors;
  }
}