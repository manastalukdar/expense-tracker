import { useExpenseStore } from '../../store/useExpenseStore';
import { DatabaseManager } from '@expense-tracker/database';
import { 
  DEFAULT_CURRENCIES, 
  DEFAULT_EXPENSE_CATEGORIES,
  Currency,
  ExpenseCategory,
  PaymentMethod
} from '@expense-tracker/shared';

// Mock the DatabaseManager
jest.mock('@expense-tracker/database', () => ({
  DatabaseManager: {
    getInstance: jest.fn()
  }
}));

const mockDatabaseManager = {
  initialize: jest.fn(),
  resetDatabase: jest.fn(),
  checkDatabaseHealth: jest.fn(),
  getCategories: jest.fn(),
  getCurrencies: jest.fn(),
  getPaymentMethods: jest.fn(),
  getTags: jest.fn(),
  getUserPreferences: jest.fn(),
  getExpenses: jest.fn(),
  createExpense: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn()
};

const mockGetInstance = DatabaseManager.getInstance as jest.MockedFunction<typeof DatabaseManager.getInstance>;
mockGetInstance.mockReturnValue(mockDatabaseManager as any);

describe('useExpenseStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store state before each test
    useExpenseStore.setState({
      expenses: [],
      categories: DEFAULT_EXPENSE_CATEGORIES,
      currencies: DEFAULT_CURRENCIES,
      paymentMethods: [],
      tags: [],
      vendors: [],
      userPreferences: null,
      isLoading: false,
      error: null,
      filter: null,
      isAppInitialized: false
    });

    // Set up default mock implementations
    mockDatabaseManager.initialize.mockResolvedValue(undefined);
    mockDatabaseManager.checkDatabaseHealth.mockResolvedValue(true);
    mockDatabaseManager.getCategories.mockResolvedValue(DEFAULT_EXPENSE_CATEGORIES);
    mockDatabaseManager.getCurrencies.mockResolvedValue(DEFAULT_CURRENCIES);
    mockDatabaseManager.getPaymentMethods.mockResolvedValue([]);
    mockDatabaseManager.getTags.mockResolvedValue([]);
    mockDatabaseManager.getUserPreferences.mockResolvedValue({
      defaultCurrency: DEFAULT_CURRENCIES[0],
      theme: 'system',
      language: 'en',
      dateFormat: 'MMM dd, yyyy',
      firstDayOfWeek: 0
    });
    mockDatabaseManager.getExpenses.mockResolvedValue([]);
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useExpenseStore.getState();

      expect(store.expenses).toEqual([]);
      expect(store.categories).toEqual(DEFAULT_EXPENSE_CATEGORIES);
      expect(store.currencies).toEqual(DEFAULT_CURRENCIES);
      expect(store.paymentMethods).toEqual([]);
      expect(store.tags).toEqual([]);
      expect(store.vendors).toEqual([]);
      expect(store.userPreferences).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.filter).toBeNull();
      expect(store.isAppInitialized).toBe(false);
    });
  });

  describe('initializeApp', () => {
    it('should initialize app successfully', async () => {
      const store = useExpenseStore.getState();

      await store.initializeApp();

      expect(mockDatabaseManager.initialize).toHaveBeenCalled();
      expect(mockDatabaseManager.getCategories).toHaveBeenCalled();
      expect(mockDatabaseManager.getCurrencies).toHaveBeenCalled();
      expect(mockDatabaseManager.getPaymentMethods).toHaveBeenCalled();
      expect(mockDatabaseManager.getTags).toHaveBeenCalled();
      expect(mockDatabaseManager.getUserPreferences).toHaveBeenCalled();
      expect(mockDatabaseManager.getExpenses).toHaveBeenCalled();
      
      const finalState = useExpenseStore.getState();
      expect(finalState.isAppInitialized).toBe(true);
      expect(finalState.isLoading).toBe(false);
      expect(finalState.error).toBeNull();
    });

    it('should handle database initialization failure with reset', async () => {
      mockDatabaseManager.initialize.mockRejectedValueOnce(new Error('DB Error'));
      mockDatabaseManager.resetDatabase.mockResolvedValueOnce(undefined);

      const store = useExpenseStore.getState();

      await store.initializeApp();

      expect(mockDatabaseManager.resetDatabase).toHaveBeenCalled();
      const finalState = useExpenseStore.getState();
      expect(finalState.isAppInitialized).toBe(true);
      expect(finalState.isLoading).toBe(false);
    });

    it('should fallback to offline mode on critical failure', async () => {
      mockDatabaseManager.initialize.mockRejectedValue(new Error('Critical DB Error'));
      mockDatabaseManager.resetDatabase.mockRejectedValue(new Error('Reset failed'));

      const store = useExpenseStore.getState();

      await store.initializeApp();

      const finalState = useExpenseStore.getState();
      expect(finalState.isAppInitialized).toBe(true);
      expect(finalState.categories).toEqual(DEFAULT_EXPENSE_CATEGORIES);
      expect(finalState.currencies).toEqual(DEFAULT_CURRENCIES);
      expect(finalState.userPreferences).toMatchObject({
        defaultCurrency: expect.any(Object),
        theme: 'system',
        language: 'en'
      });
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

    describe('createExpense', () => {
      it('should create expense and update store', async () => {
        mockDatabaseManager.createExpense.mockResolvedValue('exp1');

        const store = useExpenseStore.getState();
        await store.createExpense(mockExpenseData);

        expect(mockDatabaseManager.createExpense).toHaveBeenCalledWith(mockExpenseData);
        
        const finalState = useExpenseStore.getState();
        expect(finalState.expenses).toHaveLength(1);
        expect(finalState.expenses[0]).toMatchObject({
          id: 'exp1',
          amount: 25.50,
          vendor: 'Test Vendor'
        });
        expect(finalState.isLoading).toBe(false);
        expect(finalState.error).toBeNull();
      });

      it('should handle creation errors', async () => {
        mockDatabaseManager.createExpense.mockRejectedValue(new Error('Creation failed'));

        const store = useExpenseStore.getState();
        await store.createExpense(mockExpenseData);

        const finalState = useExpenseStore.getState();
        expect(finalState.error).toBe('Creation failed');
        expect(finalState.isLoading).toBe(false);
        expect(finalState.expenses).toHaveLength(0);
      });
    });

    describe('updateExpense', () => {
      it('should update expense and store state', async () => {
        // Set initial expense in store
        useExpenseStore.setState({
          expenses: [{
            id: 'exp1',
            amount: 25.50,
            vendor: 'Original Vendor',
            category: mockCategory,
            date: new Date(),
            currency: mockCurrency,
            createdAt: new Date(),
            updatedAt: new Date()
          }]
        });

        const updates = { amount: 30.00, vendor: 'Updated Vendor' };

        const store = useExpenseStore.getState();
        await store.updateExpense('exp1', updates);

        expect(mockDatabaseManager.updateExpense).toHaveBeenCalledWith('exp1', updates);
        
        const finalState = useExpenseStore.getState();
        expect(finalState.expenses[0].amount).toBe(30.00);
        expect(finalState.expenses[0].vendor).toBe('Updated Vendor');
        expect(finalState.isLoading).toBe(false);
      });

      it('should handle update errors', async () => {
        mockDatabaseManager.updateExpense.mockRejectedValue(new Error('Update failed'));

        const store = useExpenseStore.getState();
        await store.updateExpense('exp1', { amount: 30.00 });

        const finalState = useExpenseStore.getState();
        expect(finalState.error).toBe('Update failed');
        expect(finalState.isLoading).toBe(false);
      });
    });

    describe('deleteExpense', () => {
      it('should delete expense from store', async () => {
        // Set initial expense in store
        useExpenseStore.setState({
          expenses: [{
            id: 'exp1',
            amount: 25.50,
            vendor: 'Test Vendor',
            category: mockCategory,
            date: new Date(),
            currency: mockCurrency,
            createdAt: new Date(),
            updatedAt: new Date()
          }]
        });

        const store = useExpenseStore.getState();
        await store.deleteExpense('exp1');

        expect(mockDatabaseManager.deleteExpense).toHaveBeenCalledWith('exp1');
        
        const finalState = useExpenseStore.getState();
        expect(finalState.expenses).toHaveLength(0);
        expect(finalState.isLoading).toBe(false);
      });
    });

    describe('loadExpenses', () => {
      it('should load expenses from database', async () => {
        const mockExpenses = [
          {
            id: 'exp1',
            amount: 25.50,
            vendor: 'Test Vendor',
            category: mockCategory,
            date: new Date(),
            currency: mockCurrency,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        mockDatabaseManager.getExpenses.mockResolvedValue(mockExpenses);
        mockDatabaseManager.checkDatabaseHealth.mockResolvedValue(true);

        const store = useExpenseStore.getState();
        await store.loadExpenses();

        const finalState = useExpenseStore.getState();
        expect(finalState.expenses).toEqual(mockExpenses);
        expect(finalState.isLoading).toBe(false);
      });

      it('should handle load errors', async () => {
        mockDatabaseManager.getExpenses.mockRejectedValue(new Error('Load failed'));
        mockDatabaseManager.checkDatabaseHealth.mockResolvedValue(true);

        const store = useExpenseStore.getState();
        await store.loadExpenses();

        const finalState = useExpenseStore.getState();
        expect(finalState.error).toBe('Load failed');
        expect(finalState.isLoading).toBe(false);
      });
    });
  });

  describe('utility actions', () => {
    describe('setFilter', () => {
      it('should set filter and reload expenses', async () => {
        mockDatabaseManager.getExpenses.mockResolvedValue([]);
        mockDatabaseManager.checkDatabaseHealth.mockResolvedValue(true);

        const filter = {
          categories: ['cat1'],
          minAmount: 10
        };

        const store = useExpenseStore.getState();
        store.setFilter(filter);

        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));

        const finalState = useExpenseStore.getState();
        expect(finalState.filter).toEqual(filter);
        expect(mockDatabaseManager.getExpenses).toHaveBeenCalledWith(filter);
      });

      it('should clear filter when set to null', async () => {
        mockDatabaseManager.getExpenses.mockResolvedValue([]);
        mockDatabaseManager.checkDatabaseHealth.mockResolvedValue(true);

        const store = useExpenseStore.getState();
        store.setFilter(null);

        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));

        const finalState = useExpenseStore.getState();
        expect(finalState.filter).toBeNull();
        expect(mockDatabaseManager.getExpenses).toHaveBeenCalledWith(undefined);
      });
    });

    describe('error handling', () => {
      it('should set and clear errors', () => {
        const store = useExpenseStore.getState();
        
        store.setError('Test error');
        let state = useExpenseStore.getState();
        expect(state.error).toBe('Test error');

        store.clearError();
        state = useExpenseStore.getState();
        expect(state.error).toBeNull();
      });
    });

    describe('loading state', () => {
      it('should set loading state', () => {
        const store = useExpenseStore.getState();

        store.setLoading(true);
        let state = useExpenseStore.getState();
        expect(state.isLoading).toBe(true);

        store.setLoading(false);
        state = useExpenseStore.getState();
        expect(state.isLoading).toBe(false);
      });
    });
  });
});