
import { useExpenseStore } from "@/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowDownIcon, ArrowUpIcon, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { TransactionType } from "@/types";

export default function Dashboard() {
  const { transactions } = useExpenseStore();
  
  // Calculate total income and expenses
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;
  
  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
    
  // Calculate expense by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const categoryId = transaction.category.id;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          name: transaction.category.name,
          value: 0,
          color: getRandomColor(categoryId),
        };
      }
      acc[categoryId].value += transaction.amount;
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>);
    
  const pieChartData = Object.values(expensesByCategory);
  
  // Monthly expenses data for bar chart
  const monthlyData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const month = format(new Date(transaction.date), 'MMM');
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);
    
  const barChartData = Object.entries(monthlyData).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">${balance.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUpIcon className="mr-2 h-4 w-4 text-expense-green" />
              <span className="text-2xl font-bold">${totalIncome.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDownIcon className="mr-2 h-4 w-4 text-expense-red" />
              <span className="text-2xl font-bold">${totalExpenses.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <XAxis dataKey="name" />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Expenses']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#colorGradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9b87f5" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6E59A5" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Amount']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No expense data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Transactions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className={transaction.type === 'income' ? 'income-indicator' : 'expense-indicator'} />
                  <div className="flex justify-between items-center pl-2">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')} • {transaction.category.name}
                      </p>
                    </div>
                    <p className={cn(
                      "font-medium",
                      transaction.type === 'income' ? 'text-expense-green' : 'text-expense-red'
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recent transactions</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getRandomColor(seed: string) {
  const colors = [
    '#6E59A5', '#9b87f5', '#8B5CF6', '#D946EF', '#F97316', 
    '#0EA5E9', '#4caf50', '#ea384c'
  ];
  
  // Simple hash function to get consistent colors for categories
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
