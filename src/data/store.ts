
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Budget, Category, Transaction, TransactionType } from '@/types';

interface ExpenseStore {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
  
  // Budget actions
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, budget: Partial<Omit<Budget, 'id' | 'spent'>>) => void;
  deleteBudget: (id: string) => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      transactions: [
        {
          id: '1',
          amount: 2000,
          description: 'Salary',
          category: { id: '1', name: 'Income', icon: 'dollar-sign' },
          date: new Date('2023-09-01'),
          type: 'income',
        },
        {
          id: '2',
          amount: 500,
          description: 'Rent',
          category: { id: '2', name: 'Housing', icon: 'home' },
          date: new Date('2023-09-05'),
          type: 'expense',
        },
        {
          id: '3',
          amount: 50,
          description: 'Groceries',
          category: { id: '3', name: 'Food', icon: 'shopping-cart' },
          date: new Date('2023-09-10'),
          type: 'expense',
        },
        {
          id: '4',
          amount: 30,
          description: 'Gas',
          category: { id: '4', name: 'Transportation', icon: 'car' },
          date: new Date('2023-09-15'),
          type: 'expense',
        },
        {
          id: '5',
          amount: 100,
          description: 'Freelance work',
          category: { id: '1', name: 'Income', icon: 'dollar-sign' },
          date: new Date('2023-09-20'),
          type: 'income',
        },
      ],
      categories: [
        { id: '1', name: 'Income', icon: 'dollar-sign' },
        { id: '2', name: 'Housing', icon: 'home' },
        { id: '3', name: 'Food', icon: 'shopping-cart' },
        { id: '4', name: 'Transportation', icon: 'car' },
        { id: '5', name: 'Entertainment', icon: 'film' },
        { id: '6', name: 'Healthcare', icon: 'activity' },
        { id: '7', name: 'Education', icon: 'book' },
        { id: '8', name: 'Shopping', icon: 'shopping-bag' },
        { id: '9', name: 'Utilities', icon: 'zap' },
      ],
      budgets: [
        {
          id: '1',
          category: { id: '3', name: 'Food', icon: 'shopping-cart' },
          amount: 300,
          period: 'monthly',
          spent: 50,
        },
        {
          id: '2',
          category: { id: '2', name: 'Housing', icon: 'home' },
          amount: 800,
          period: 'monthly',
          spent: 500,
        },
        {
          id: '3',
          category: { id: '4', name: 'Transportation', icon: 'car' },
          amount: 150,
          period: 'monthly',
          spent: 30,
        },
      ],
      
      addTransaction: (transaction) => 
        set((state) => ({
          transactions: [...state.transactions, { ...transaction, id: uuidv4() }],
        })),
        
      updateTransaction: (id, transaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...transaction } : t
          ),
        })),
        
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
        
      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, { ...category, id: uuidv4() }],
        })),
        
      updateCategory: (id, category) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        })),
        
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
        
      addBudget: (budget) =>
        set((state) => ({
          budgets: [...state.budgets, { ...budget, id: uuidv4(), spent: 0 }],
        })),
        
      updateBudget: (id, budget) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...budget } : b
          ),
        })),
        
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),
    }),
    {
      name: 'expense-store',
    }
  )
);
