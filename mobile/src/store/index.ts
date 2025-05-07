import { configureStore } from '@reduxjs/toolkit';
import expenseReducer from './slices/expenseSlice';

export const store = configureStore({
  reducer: {
    expenses: expenseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
