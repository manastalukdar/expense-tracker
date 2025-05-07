export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface RootState {
  expenses: {
    expenses: Expense[];
  };
}