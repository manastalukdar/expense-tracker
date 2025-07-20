import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  Expense, 
  ExpenseCategory, 
  Currency, 
  UserPreferences, 
  ExpenseFilter,
  DEFAULT_CURRENCIES,
  DEFAULT_EXPENSE_CATEGORIES
} from '@expense-tracker/shared';
import { DatabaseManager } from '@expense-tracker/database';

interface ExpenseState {
  // Data
  expenses: Expense[];
  categories: ExpenseCategory[];
  currencies: Currency[];
  userPreferences: UserPreferences | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  filter: ExpenseFilter | null;
  
  // Actions
  initializeApp: () => Promise<void>;
  
  // Expense actions
  createExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  loadExpenses: (filter?: ExpenseFilter, refresh?: boolean) => Promise<void>;
  
  // Category actions
  loadCategories: () => Promise<void>;
  createCategory: (category: Omit<ExpenseCategory, 'id'>) => Promise<void>;
  
  // Currency actions
  loadCurrencies: () => Promise<void>;
  
  // User preferences actions
  loadUserPreferences: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  
  // Filter actions
  setFilter: (filter: ExpenseFilter | null) => void;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useExpenseStore = create<ExpenseState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    expenses: [],
    categories: DEFAULT_EXPENSE_CATEGORIES,
    currencies: DEFAULT_CURRENCIES,
    userPreferences: null,
    isLoading: false,
    error: null,
    filter: null,

    // Initialize app
    initializeApp: async () => {
      try {
        console.log('🚀 Starting app initialization...');
        set({ isLoading: true, error: null });
        
        // Try full initialization with database
        try {
          console.log('📦 Creating DatabaseManager instance...');
          const db = DatabaseManager.getInstance();
          
          console.log('🗄️ Initializing database...');
          await db.initialize();
          console.log('✅ Database initialized successfully');
          
          console.log('📊 Loading initial data...');
          // Load all initial data with individual logging
          console.log('  🏷️ Loading categories...');
          await get().loadCategories();
          console.log('  💰 Loading currencies...');
          await get().loadCurrencies();
          console.log('  ⚙️ Loading user preferences...');
          await get().loadUserPreferences();
          console.log('  📋 Loading expenses...');
          await get().loadExpenses();
          
          console.log('🎉 App initialization completed successfully');
          set({ isLoading: false });
        } catch (dbError) {
          console.warn('⚠️ Database initialization failed, using fallback mode:', dbError);
          
          // Fallback initialization without database
          console.log('🔄 Initializing in offline mode...');
          
          // Set default currencies
          const defaultCurrency = DEFAULT_CURRENCIES.find(c => c.code === 'USD') || DEFAULT_CURRENCIES[0];
          
          set({
            currencies: DEFAULT_CURRENCIES,
            categories: DEFAULT_EXPENSE_CATEGORIES,
            userPreferences: {
              defaultCurrency,
              theme: 'system',
              language: 'en',
              dateFormat: 'MMM dd, yyyy',
              firstDayOfWeek: 0,
            },
            expenses: [],
            isLoading: false,
            error: null // Clear error to allow app to function
          });
          
          console.log('✅ Fallback initialization completed');
        }
      } catch (error) {
        console.error('❌ Critical initialization failure:', error);
        console.error('Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Critical initialization failed' 
        });
      }
    },

    // Expense actions
    createExpense: async (expenseData) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        const id = await db.createExpense(expenseData);
        
        // Create the full expense object
        const newExpense: Expense = {
          ...expenseData,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => ({ 
          expenses: [newExpense, ...state.expenses],
          isLoading: false 
        }));
      } catch (error) {
        console.error('Failed to create expense:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to create expense' 
        });
      }
    },

    updateExpense: async (id, updates) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        await db.updateExpense(id, updates);
        
        set(state => ({
          expenses: state.expenses.map(expense => 
            expense.id === id 
              ? { ...expense, ...updates, updatedAt: new Date() }
              : expense
          ),
          isLoading: false
        }));
      } catch (error) {
        console.error('Failed to update expense:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to update expense' 
        });
      }
    },

    deleteExpense: async (id) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        await db.deleteExpense(id);
        
        set(state => ({
          expenses: state.expenses.filter(expense => expense.id !== id),
          isLoading: false
        }));
      } catch (error) {
        console.error('Failed to delete expense:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to delete expense' 
        });
      }
    },

    loadExpenses: async (filter, refresh = false) => {
      try {
        if (refresh) {
          set({ isLoading: true, error: null });
        }
        
        const db = DatabaseManager.getInstance();
        const expenses = await db.getExpenses(filter);
        
        set({ 
          expenses, 
          isLoading: false,
          filter: filter || null
        });
      } catch (error) {
        console.error('Failed to load expenses:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to load expenses' 
        });
      }
    },

    // Category actions
    loadCategories: async () => {
      try {
        const db = DatabaseManager.getInstance();
        const categories = await db.getCategories();
        set({ categories });
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Keep default categories on error
      }
    },

    createCategory: async (categoryData) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        const id = await db.createCategory(categoryData);
        
        const newCategory: ExpenseCategory = {
          ...categoryData,
          id,
        };
        
        set(state => ({ 
          categories: [...state.categories, newCategory],
          isLoading: false 
        }));
      } catch (error) {
        console.error('Failed to create category:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to create category' 
        });
      }
    },

    // Currency actions
    loadCurrencies: async () => {
      try {
        const db = DatabaseManager.getInstance();
        const currencies = await db.getCurrencies();
        set({ currencies });
      } catch (error) {
        console.error('Failed to load currencies:', error);
        // Keep default currencies on error
      }
    },

    // User preferences actions
    loadUserPreferences: async () => {
      try {
        const db = DatabaseManager.getInstance();
        const preferences = await db.getUserPreferences();
        set({ userPreferences: preferences });
      } catch (error) {
        console.error('Failed to load user preferences:', error);
        // Set default preferences
        const defaultCurrency = DEFAULT_CURRENCIES.find(c => c.code === 'USD') || DEFAULT_CURRENCIES[0];
        set({ 
          userPreferences: {
            defaultCurrency,
            theme: 'system',
            language: 'en',
            dateFormat: 'MMM dd, yyyy',
            firstDayOfWeek: 0,
          }
        });
      }
    },

    updateUserPreferences: async (updates) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        await db.updateUserPreferences(updates);
        
        set(state => ({
          userPreferences: state.userPreferences 
            ? { ...state.userPreferences, ...updates }
            : null,
          isLoading: false
        }));
      } catch (error) {
        console.error('Failed to update user preferences:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to update preferences' 
        });
      }
    },

    // Filter actions
    setFilter: (filter) => {
      set({ filter });
      // Automatically reload expenses with new filter
      get().loadExpenses(filter || undefined);
    },

    // Utility actions
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
  }))
);