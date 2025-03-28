
export type TransactionType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color?: string;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: Date;
  type: TransactionType;
};

export type Budget = {
  id: string;
  category: Category;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly';
  spent: number;
};

export type DashboardStats = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  recentTransactions: Transaction[];
  topCategories: {
    category: Category;
    amount: number;
    percentage: number;
  }[];
};
