import { DatabaseManager } from '../DatabaseManager';
import SQLite from 'react-native-sqlite-storage';
import { 
  Currency, 
  ExpenseCategory, 
  PaymentMethod, 
  Tag, 
  Expense,
  ExpenseFilter,
  PaymentMethodFormData,
  CategoryFormData,
  TagFormData 
} from '@expense-tracker/shared';

// Mock the SQLite module
const mockDatabase = {
  executeSql: jest.fn(),
  close: jest.fn()
};

(SQLite.openDatabase as jest.Mock).mockResolvedValue(mockDatabase);
(SQLite.deleteDatabase as jest.Mock).mockResolvedValue(undefined);

describe('DatabaseManager', () => {
  let dbManager: DatabaseManager;

  beforeEach(() => {
    jest.clearAllMocks();
    dbManager = DatabaseManager.getInstance();
    mockDatabase.executeSql.mockClear();
  });

  afterEach(() => {
    // Reset singleton instance for clean tests
    (DatabaseManager as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = DatabaseManager.getInstance();
      const instance2 = DatabaseManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      mockDatabase.executeSql.mockResolvedValue([{ rows: { length: 0 } }]);
    });

    it('should open database and create tables', async () => {
      await dbManager.initialize();

      expect(SQLite.openDatabase).toHaveBeenCalledWith({
        name: 'ExpenseTracker.db',
        location: 'default'
      });

      // Verify essential tables are created
      const executeSqlCalls = mockDatabase.executeSql.mock.calls;
      const tableCreationCalls = executeSqlCalls.filter(call => 
        call[0].includes('CREATE TABLE IF NOT EXISTS')
      );
      
      expect(tableCreationCalls.length).toBeGreaterThan(0);
      expect(tableCreationCalls.some(call => call[0].includes('expenses'))).toBe(true);
      expect(tableCreationCalls.some(call => call[0].includes('categories'))).toBe(true);
      expect(tableCreationCalls.some(call => call[0].includes('currencies'))).toBe(true);
    });

    it('should handle database initialization errors', async () => {
      (SQLite.openDatabase as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await expect(dbManager.initialize()).rejects.toThrow('Database error');
    });
  });

  describe('checkDatabaseHealth', () => {
    it('should return true when all essential tables exist', async () => {
      mockDatabase.executeSql
        .mockResolvedValueOnce([{ rows: { length: 1 } }]) // expenses table exists
        .mockResolvedValueOnce([{ rows: { length: 0 } }]) // simple query on expenses
        .mockResolvedValueOnce([{ rows: { length: 1 } }]) // categories table exists
        .mockResolvedValueOnce([{ rows: { length: 0 } }]) // simple query on categories
        .mockResolvedValueOnce([{ rows: { length: 1 } }]) // currencies table exists
        .mockResolvedValueOnce([{ rows: { length: 0 } }]) // simple query on currencies
        .mockResolvedValueOnce([{ rows: { length: 1 } }]) // payment_methods table exists
        .mockResolvedValueOnce([{ rows: { length: 0 } }]) // simple query on payment_methods
        .mockResolvedValueOnce([{ rows: { length: 1 } }]) // user_preferences table exists
        .mockResolvedValueOnce([{ rows: { length: 0 } }]); // simple query on user_preferences

      // Initialize the database connection first
      (dbManager as any).db = mockDatabase;

      const result = await dbManager.checkDatabaseHealth();
      expect(result).toBe(true);
    });

    it('should return false when database is not initialized', async () => {
      (dbManager as any).db = null;
      const result = await dbManager.checkDatabaseHealth();
      expect(result).toBe(false);
    });

    it('should return false when tables are missing', async () => {
      mockDatabase.executeSql.mockResolvedValueOnce([{ rows: { length: 0 } }]); // table doesn't exist
      (dbManager as any).db = mockDatabase;

      const result = await dbManager.checkDatabaseHealth();
      expect(result).toBe(false);
    });
  });

  describe('expense operations', () => {
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

    const mockExpenseData = {
      amount: 25.50,
      description: 'Test expense',
      vendor: 'Test Vendor',
      category: mockCategory,
      date: new Date('2024-01-15'),
      currency: mockCurrency,
      paymentMethod: mockPaymentMethod,
      location: 'Test Location',
      notes: 'Test notes'
    };

    beforeEach(() => {
      (dbManager as any).db = mockDatabase;
    });

    describe('createExpense', () => {
      it('should create expense and return ID', async () => {
        mockDatabase.executeSql.mockResolvedValue([{ rows: { length: 0 } }]);

        const id = await dbManager.createExpense(mockExpenseData);

        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
        expect(mockDatabase.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO expenses'),
          expect.arrayContaining([
            id,
            mockExpenseData.amount,
            mockExpenseData.description,
            mockExpenseData.vendor
          ])
        );
      });

      it('should handle expenses without optional fields', async () => {
        const minimalExpense = {
          amount: 10.00,
          vendor: 'Vendor',
          category: mockCategory,
          date: new Date(),
          currency: mockCurrency
        };

        mockDatabase.executeSql.mockResolvedValue([{ rows: { length: 0 } }]);

        const id = await dbManager.createExpense(minimalExpense);
        expect(typeof id).toBe('string');
      });

      it('should throw error when database is not initialized', async () => {
        (dbManager as any).db = null;

        await expect(dbManager.createExpense(mockExpenseData))
          .rejects.toThrow('Database not initialized');
      });
    });

    describe('updateExpense', () => {
      it('should update expense fields', async () => {
        const updates = {
          amount: 30.00,
          description: 'Updated description',
          vendor: 'Updated Vendor'
        };

        await dbManager.updateExpense('expense1', updates);

        expect(mockDatabase.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE expenses SET'),
          expect.arrayContaining([30.00, 'Updated description', 'Updated Vendor'])
        );
      });

      it('should handle partial updates', async () => {
        const updates = { amount: 40.00 };

        await dbManager.updateExpense('expense1', updates);

        expect(mockDatabase.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE expenses SET amount = ?'),
          expect.arrayContaining([40.00])
        );
      });
    });

    describe('deleteExpense', () => {
      it('should delete expense by ID', async () => {
        await dbManager.deleteExpense('expense1');

        expect(mockDatabase.executeSql).toHaveBeenCalledWith(
          'DELETE FROM expenses WHERE id = ?',
          ['expense1']
        );
      });
    });

    describe('getExpenses', () => {
      it('should return expenses with joined data', async () => {
        const mockRow = {
          id: 'exp1',
          amount: 25.50,
          description: 'Test',
          vendor: 'Vendor',
          date: '2024-01-15T00:00:00.000Z',
          location: 'Location',
          notes: 'Notes',
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z',
          category_id: 'cat1',
          category_name: 'Food',
          category_color: '#FF0000',
          category_icon: '🍕',
          currency_code: 'USD',
          currency_symbol: '$',
          currency_name: 'US Dollar',
          payment_method_id: 'pm1',
          payment_method_name: 'Credit Card',
          payment_method_type: 'credit_card'
        };

        mockDatabase.executeSql.mockResolvedValueOnce([{
          rows: {
            length: 1,
            item: jest.fn().mockReturnValue(mockRow)
          }
        }]);

        // Mock getExpenseTags
        mockDatabase.executeSql.mockResolvedValueOnce([{ rows: { length: 0 } }]);

        const expenses = await dbManager.getExpenses();

        expect(expenses).toHaveLength(1);
        expect(expenses[0]).toMatchObject({
          id: 'exp1',
          amount: 25.50,
          vendor: 'Vendor',
          category: {
            id: 'cat1',
            name: 'Food',
            color: '#FF0000',
            icon: '🍕'
          },
          currency: {
            code: 'USD',
            symbol: '$',
            name: 'US Dollar'
          }
        });
      });

      it('should filter expenses by date range', async () => {
        const filter: ExpenseFilter = {
          dateRange: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31')
          }
        };

        mockDatabase.executeSql.mockResolvedValue([{ rows: { length: 0 } }]);

        await dbManager.getExpenses(filter);

        expect(mockDatabase.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('WHERE e.date >= ? AND e.date <= ?'),
          expect.arrayContaining(['2024-01-01T00:00:00.000Z', '2024-01-31T00:00:00.000Z'])
        );
      });
    });
  });

  describe('category operations', () => {
    beforeEach(() => {
      (dbManager as any).db = mockDatabase;
    });

    describe('getCategories', () => {
      it('should return categories', async () => {
        const mockRow = {
          id: 'cat1',
          name: 'Food',
          color: '#FF0000',
          icon: '🍕',
          parent_id: null
        };

        mockDatabase.executeSql.mockResolvedValue([{
          rows: {
            length: 1,
            item: jest.fn().mockReturnValue(mockRow)
          }
        }]);

        const categories = await dbManager.getCategories();

        expect(categories).toHaveLength(1);
        expect(categories[0]).toEqual({
          id: 'cat1',
          name: 'Food',
          color: '#FF0000',
          icon: '🍕',
          parentId: null
        });
      });
    });

    describe('createCategory', () => {
      it('should create category and return ID', async () => {
        const categoryData: CategoryFormData = {
          name: 'New Category',
          color: '#00FF00',
          icon: '📱'
        };

        const id = await dbManager.createCategory(categoryData);

        expect(typeof id).toBe('string');
        expect(mockDatabase.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO categories'),
          expect.arrayContaining([id, 'New Category', '#00FF00', '📱', null])
        );
      });
    });

    describe('deleteCategory', () => {
      it('should delete category when no children or expenses exist', async () => {
        // Mock queries to show no children and no expenses
        mockDatabase.executeSql
          .mockResolvedValueOnce([{ rows: { item: jest.fn().mockReturnValue({ count: 0 }) } }]) // no children
          .mockResolvedValueOnce([{ rows: { item: jest.fn().mockReturnValue({ count: 0 }) } }]) // no expenses
          .mockResolvedValueOnce([{ rows: { length: 0 } }]); // delete query

        await dbManager.deleteCategory('cat1');

        expect(mockDatabase.executeSql).toHaveBeenLastCalledWith(
          'DELETE FROM categories WHERE id = ?',
          ['cat1']
        );
      });

      it('should throw error when category has children', async () => {
        mockDatabase.executeSql.mockResolvedValueOnce([{ 
          rows: { item: jest.fn().mockReturnValue({ count: 1 }) } 
        }]);

        await expect(dbManager.deleteCategory('cat1'))
          .rejects.toThrow('Cannot delete category with child categories');
      });

      it('should throw error when category is used in expenses', async () => {
        mockDatabase.executeSql
          .mockResolvedValueOnce([{ rows: { item: jest.fn().mockReturnValue({ count: 0 }) } }]) // no children
          .mockResolvedValueOnce([{ rows: { item: jest.fn().mockReturnValue({ count: 1 }) } }]); // has expenses

        await expect(dbManager.deleteCategory('cat1'))
          .rejects.toThrow('Cannot delete category that is used in expenses');
      });
    });
  });

  describe('payment method operations', () => {
    beforeEach(() => {
      (dbManager as any).db = mockDatabase;
    });

    describe('createPaymentMethod', () => {
      it('should create payment method and handle default setting', async () => {
        const paymentMethodData: PaymentMethodFormData = {
          type: 'credit_card',
          name: 'My Credit Card',
          isDefault: true,
          color: '#007AFF',
          icon: '💳'
        };

        mockDatabase.executeSql.mockResolvedValue([{ rows: { length: 0 } }]);

        const id = await dbManager.createPaymentMethod(paymentMethodData);

        expect(typeof id).toBe('string');
        
        // Should clear default from other payment methods first
        expect(mockDatabase.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE payment_methods SET is_default = 0'),
          expect.any(Array)
        );

        // Should create new payment method
        expect(mockDatabase.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO payment_methods'),
          expect.arrayContaining([id, 'credit_card', 'My Credit Card'])
        );
      });
    });

    describe('deletePaymentMethod', () => {
      it('should soft delete payment method', async () => {
        await dbManager.deletePaymentMethod('pm1');

        expect(mockDatabase.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE payment_methods SET is_active = 0'),
          expect.arrayContaining(['pm1'])
        );
      });
    });
  });

  describe('tag operations', () => {
    beforeEach(() => {
      (dbManager as any).db = mockDatabase;
    });

    describe('createTag', () => {
      it('should create tag and return ID', async () => {
        const tagData: TagFormData = {
          name: 'Business',
          color: '#0000FF'
        };

        const id = await dbManager.createTag(tagData);

        expect(typeof id).toBe('string');
        expect(mockDatabase.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO tags'),
          expect.arrayContaining([id, 'Business', '#0000FF'])
        );
      });
    });

    describe('getOrCreateTag', () => {
      it('should return existing tag when found', async () => {
        const mockRow = {
          id: 'tag1',
          name: 'Business',
          color: '#0000FF',
          created_at: '2024-01-15T00:00:00.000Z'
        };

        mockDatabase.executeSql.mockResolvedValue([{
          rows: {
            length: 1,
            item: jest.fn().mockReturnValue(mockRow)
          }
        }]);

        const tag = await dbManager.getOrCreateTag('Business');

        expect(tag).toEqual({
          id: 'tag1',
          name: 'Business',
          color: '#0000FF',
          usageCount: 0,
          createdAt: new Date('2024-01-15T00:00:00.000Z')
        });
      });

      it('should create new tag when not found', async () => {
        mockDatabase.executeSql
          .mockResolvedValueOnce([{ rows: { length: 0 } }]) // search returns empty
          .mockResolvedValueOnce([{ rows: { length: 0 } }]); // create tag

        const tag = await dbManager.getOrCreateTag('NewTag');

        expect(tag.name).toBe('NewTag');
        expect(typeof tag.id).toBe('string');
      });
    });

    describe('searchTags', () => {
      it('should search tags by name', async () => {
        const mockRow = {
          id: 'tag1',
          name: 'Business',
          color: '#0000FF',
          usage_count: 5,
          created_at: '2024-01-15T00:00:00.000Z'
        };

        mockDatabase.executeSql.mockResolvedValue([{
          rows: {
            length: 1,
            item: jest.fn().mockReturnValue(mockRow)
          }
        }]);

        const tags = await dbManager.searchTags('bus');

        expect(tags).toHaveLength(1);
        expect(tags[0].name).toBe('Business');
        expect(mockDatabase.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('WHERE t.name LIKE ?'),
          ['%bus%']
        );
      });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (dbManager as any).db = mockDatabase;
    });

    it('should handle database execution errors', async () => {
      mockDatabase.executeSql.mockRejectedValue(new Error('SQL Error'));

      await expect(dbManager.createExpense({
        amount: 10,
        vendor: 'Test',
        category: { id: 'cat1' } as ExpenseCategory,
        date: new Date(),
        currency: { code: 'USD' } as Currency
      })).rejects.toThrow('SQL Error');
    });

    it('should handle missing database connection', async () => {
      (dbManager as any).db = null;

      await expect(dbManager.getCategories())
        .rejects.toThrow('Database not initialized');
    });
  });
});