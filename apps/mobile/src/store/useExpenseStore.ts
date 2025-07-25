import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  Expense, 
  ExpenseCategory, 
  Currency, 
  UserPreferences, 
  ExpenseFilter,
  PaymentMethod,
  Tag,
  Vendor,
  CategoryTree,
  CategoryFormData,
  PaymentMethodFormData,
  TagFormData,
  DEFAULT_CURRENCIES,
  DEFAULT_EXPENSE_CATEGORIES
} from '@expense-tracker/shared';
import { DatabaseManager } from '@expense-tracker/database';

interface ExpenseState {
  // Data
  expenses: Expense[];
  categories: ExpenseCategory[];
  currencies: Currency[];
  paymentMethods: PaymentMethod[];
  tags: Tag[];
  vendors: string[];
  userPreferences: UserPreferences | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  filter: ExpenseFilter | null;
  isAppInitialized: boolean;
  
  // Actions
  initializeApp: () => Promise<void>;
  resetInitialization: () => void;
  
  // Expense actions
  createExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  loadExpenses: (filter?: ExpenseFilter, refresh?: boolean) => Promise<void>;
  
  // Category actions
  loadCategories: () => Promise<void>;
  getCategoryTree: () => Promise<CategoryTree[]>;
  createCategory: (data: CategoryFormData) => Promise<string>;
  updateCategory: (id: string, data: Partial<CategoryFormData>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  moveCategoryToParent: (categoryId: string, newParentId?: string) => Promise<void>;
  
  // Payment Method actions
  loadPaymentMethods: () => Promise<void>;
  createPaymentMethod: (data: PaymentMethodFormData) => Promise<string>;
  updatePaymentMethod: (id: string, data: Partial<PaymentMethodFormData>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  
  // Tag actions
  loadTags: () => Promise<void>;
  createTag: (data: TagFormData) => Promise<string>;
  updateTag: (id: string, data: Partial<TagFormData>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  searchTags: (query: string) => Promise<Tag[]>;
  getOrCreateTag: (name: string) => Promise<Tag>;
  
  // Vendor actions
  loadVendors: () => Promise<void>;
  searchVendors: (query: string) => Promise<string[]>;
  getPopularVendors: () => Promise<string[]>;
  
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
    paymentMethods: [],
    tags: [],
    vendors: [],
    userPreferences: null,
    isLoading: false,
    error: null,
    filter: null,
    isAppInitialized: false,

    // Reset initialization state (for retry)
    resetInitialization: () => {
      set({ 
        isLoading: false, 
        error: null, 
        isAppInitialized: false 
      });
    },

    // Initialize app
    initializeApp: async () => {
      const state = get();
      
      // Prevent multiple concurrent initializations, but allow retry if there was an error
      if (state.isLoading || (state.isAppInitialized && !state.error)) {
        console.log('🔄 Initialization already in progress or completed, skipping...');
        return;
      }
      
      try {
        console.log('🚀 Starting app initialization...');
        set({ isLoading: true, error: null });
        
        // Small delay to ensure React Native is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
          console.log('  💳 Loading payment methods...');
          await get().loadPaymentMethods();
          console.log('  🏷️ Loading tags...');
          await get().loadTags();
          console.log('  ⚙️ Loading user preferences...');
          await get().loadUserPreferences();
          console.log('  📋 Loading expenses...');
          await get().loadExpenses();
          
          console.log('🎉 App initialization completed successfully');
          set({ isLoading: false, isAppInitialized: true });
        } catch (dbError) {
          console.warn('⚠️ Database initialization failed:', dbError);
          
          // Try database reset as last resort
          try {
            console.log('🔄 Attempting database reset...');
            const db = DatabaseManager.getInstance();
            await db.resetDatabase();
            
            console.log('📊 Loading initial data after reset...');
            await get().loadCategories();
            await get().loadCurrencies();
            await get().loadPaymentMethods();
            await get().loadTags();
            await get().loadUserPreferences();
            await get().loadExpenses();
            
            console.log('✅ Database reset and initialization successful');
            set({ isLoading: false, isAppInitialized: true });
            return;
          } catch (resetError) {
            console.error('❌ Database reset also failed:', resetError);
          }
          
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
            isAppInitialized: true,
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
        // Even on critical error, try to initialize in offline mode
        console.log('🔄 Attempting final fallback initialization...');
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
          paymentMethods: [],
          tags: [],
          isLoading: false,
          isAppInitialized: true,
          error: null // Clear error to allow app to function
        });
        
        console.log('✅ Final fallback initialization completed - app ready in offline mode');
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
        
        // Note: Removed initialization check here since this function is called during initialization
        
        const db = DatabaseManager.getInstance();
        
        // Check if database is healthy, if not try to initialize
        const isHealthy = await db.checkDatabaseHealth();
        if (!isHealthy) {
          console.log('🔄 Database not healthy, attempting initialization...');
          await db.initialize();
          
          // Check again after initialization
          const isHealthyAfterInit = await db.checkDatabaseHealth();
          if (!isHealthyAfterInit) {
            throw new Error('Database initialization failed - tables not created');
          }
        }
        
        const expenses = await db.getExpenses(filter);
        
        set({ 
          expenses, 
          isLoading: false,
          filter: filter || null
        });
      } catch (error) {
        console.error('Failed to load expenses:', error);
        
        // Provide more specific error message for table issues
        let errorMessage = 'Failed to load expenses';
        if (error instanceof Error) {
          if (error.message.includes('no such table')) {
            errorMessage = 'Database not initialized - tables missing. Please restart the app.';
          } else {
            errorMessage = error.message;
          }
        }
        
        set({ 
          isLoading: false, 
          error: errorMessage
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

    // Enhanced Category actions
    getCategoryTree: async () => {
      try {
        const db = DatabaseManager.getInstance();
        return await db.getCategoryTree();
      } catch (error) {
        console.error('Failed to get category tree:', error);
        return [];
      }
    },

    createCategory: async (data) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        const id = await db.createCategory(data);
        
        // Reload categories to get updated list
        await get().loadCategories();
        
        set({ isLoading: false });
        return id;
      } catch (error) {
        console.error('Failed to create category:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to create category' 
        });
        throw error;
      }
    },

    updateCategory: async (id, data) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        await db.updateCategory(id, data);
        
        // Reload categories to get updated list
        await get().loadCategories();
        
        set({ isLoading: false });
      } catch (error) {
        console.error('Failed to update category:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to update category' 
        });
        throw error;
      }
    },

    deleteCategory: async (id) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        await db.deleteCategory(id);
        
        // Reload categories to get updated list
        await get().loadCategories();
        
        set({ isLoading: false });
      } catch (error) {
        console.error('Failed to delete category:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to delete category' 
        });
        throw error;
      }
    },

    moveCategoryToParent: async (categoryId, newParentId) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        await db.moveCategoryToParent(categoryId, newParentId);
        
        // Reload categories to get updated list
        await get().loadCategories();
        
        set({ isLoading: false });
      } catch (error) {
        console.error('Failed to move category:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to move category' 
        });
        throw error;
      }
    },

    // Payment Method actions
    loadPaymentMethods: async () => {
      try {
        const db = DatabaseManager.getInstance();
        const paymentMethods = await db.getPaymentMethods();
        set({ paymentMethods });
      } catch (error) {
        console.error('Failed to load payment methods:', error);
        // Keep empty array on error
      }
    },

    createPaymentMethod: async (data) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        const id = await db.createPaymentMethod(data);
        
        // Reload payment methods to get updated list
        await get().loadPaymentMethods();
        
        set({ isLoading: false });
        return id;
      } catch (error) {
        console.error('Failed to create payment method:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to create payment method' 
        });
        throw error;
      }
    },

    updatePaymentMethod: async (id, data) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        await db.updatePaymentMethod(id, data);
        
        // Reload payment methods to get updated list
        await get().loadPaymentMethods();
        
        set({ isLoading: false });
      } catch (error) {
        console.error('Failed to update payment method:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to update payment method' 
        });
        throw error;
      }
    },

    deletePaymentMethod: async (id) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        await db.deletePaymentMethod(id);
        
        // Reload payment methods to get updated list
        await get().loadPaymentMethods();
        
        set({ isLoading: false });
      } catch (error) {
        console.error('Failed to delete payment method:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to delete payment method' 
        });
        throw error;
      }
    },

    // Tag actions
    loadTags: async () => {
      try {
        const db = DatabaseManager.getInstance();
        const tags = await db.getTags();
        set({ tags });
      } catch (error) {
        console.error('Failed to load tags:', error);
        // Keep empty array on error
      }
    },

    createTag: async (data) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        const id = await db.createTag(data);
        
        // Reload tags to get updated list
        await get().loadTags();
        
        set({ isLoading: false });
        return id;
      } catch (error) {
        console.error('Failed to create tag:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to create tag' 
        });
        throw error;
      }
    },

    updateTag: async (id, data) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        await db.updateTag(id, data);
        
        // Reload tags to get updated list
        await get().loadTags();
        
        set({ isLoading: false });
      } catch (error) {
        console.error('Failed to update tag:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to update tag' 
        });
        throw error;
      }
    },

    deleteTag: async (id) => {
      try {
        set({ isLoading: true, error: null });
        
        const db = DatabaseManager.getInstance();
        await db.deleteTag(id);
        
        // Reload tags to get updated list
        await get().loadTags();
        
        set({ isLoading: false });
      } catch (error) {
        console.error('Failed to delete tag:', error);
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to delete tag' 
        });
        throw error;
      }
    },

    searchTags: async (query) => {
      try {
        const db = DatabaseManager.getInstance();
        return await db.searchTags(query);
      } catch (error) {
        console.error('Failed to search tags:', error);
        return [];
      }
    },

    getOrCreateTag: async (name) => {
      try {
        const db = DatabaseManager.getInstance();
        const tag = await db.getOrCreateTag(name);
        
        // Reload tags to get updated list if new tag was created
        await get().loadTags();
        
        return tag;
      } catch (error) {
        console.error('Failed to get or create tag:', error);
        throw error;
      }
    },

    // Vendor actions
    loadVendors: async () => {
      try {
        const db = DatabaseManager.getInstance();
        const vendors = await db.getPopularVendors(50); // Get top 50 vendors
        set({ vendors });
      } catch (error) {
        console.error('Failed to load vendors:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to load vendors' });
      }
    },

    searchVendors: async (query) => {
      try {
        const db = DatabaseManager.getInstance();
        return await db.searchVendors(query, 10);
      } catch (error) {
        console.error('Failed to search vendors:', error);
        return [];
      }
    },

    getPopularVendors: async () => {
      try {
        const db = DatabaseManager.getInstance();
        return await db.getPopularVendors(10);
      } catch (error) {
        console.error('Failed to get popular vendors:', error);
        return [];
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