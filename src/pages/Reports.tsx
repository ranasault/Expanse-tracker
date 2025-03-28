
import { useState } from "react";
import { useExpenseStore } from "@/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format, sub, startOfMonth, endOfMonth } from "date-fns";

export default function Reports() {
  const { transactions } = useExpenseStore();
  const [period, setPeriod] = useState("monthly");
  const [reportType, setReportType] = useState("expense");
  
  // Determine date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case "weekly":
        return {
          start: sub(now, { weeks: 1 }),
          end: now,
          format: "EEE",
        };
      case "monthly":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          format: "dd",
        };
      case "yearly":
        return {
          start: sub(now, { years: 1 }),
          end: now,
          format: "MMM",
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          format: "dd",
        };
    }
  };
  
  const { start, end, format: dateFormat } = getDateRange();
  
  // Filter transactions by date and type
  const filteredTransactions = transactions.filter(
    (t) => 
      new Date(t.date) >= start &&
      new Date(t.date) <= end &&
      (reportType === "all" || t.type === reportType)
  );
  
  // Prepare data for charts based on selected period
  const prepareChartData = () => {
    const data: Record<string, any> = {};
    
    filteredTransactions.forEach((t) => {
      const dateKey = format(new Date(t.date), dateFormat);
      if (!data[dateKey]) {
        data[dateKey] = {
          date: dateKey,
          income: 0,
          expense: 0,
          total: 0,
        };
      }
      
      if (t.type === "income") {
        data[dateKey].income += t.amount;
        data[dateKey].total += t.amount;
      } else {
        data[dateKey].expense += t.amount;
        data[dateKey].total -= t.amount;
      }
    });
    
    return Object.values(data);
  };
  
  const chartData = prepareChartData();
  
  // Prepare data for category pie chart
  const prepareCategoryData = () => {
    const data: Record<string, { name: string; value: number; color: string }> = {};
    
    filteredTransactions
      .filter(t => reportType === "all" ? true : t.type === reportType)
      .forEach((t) => {
        const categoryName = t.category.name;
        if (!data[categoryName]) {
          data[categoryName] = {
            name: categoryName,
            value: 0,
            color: getCategoryColor(categoryName),
          };
        }
        
        data[categoryName].value += t.amount;
      });
    
    return Object.values(data);
  };
  
  const categoryData = prepareCategoryData();
  
  // Calculate summaries
  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Reports</h1>
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Tabs 
          value={reportType} 
          onValueChange={setReportType}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">This Week</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="yearly">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense-green">
              ${totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense-red">
              ${totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-expense-green" : "text-expense-red"}`}>
              ${balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, '']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    {(reportType === "all" || reportType === "income") && (
                      <Line
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#4caf50"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    )}
                    {(reportType === "all" || reportType === "expense") && (
                      <Line
                        type="monotone"
                        dataKey="expense"
                        name="Expenses"
                        stroke="#ea384c"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    )}
                    {reportType === "all" && (
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Balance"
                        stroke="#6E59A5"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available for this period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`$${value}`, '']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available for this period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, '']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  {(reportType === "all" || reportType === "income") && (
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#4caf50"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {(reportType === "all" || reportType === "expense") && (
                    <Bar
                      dataKey="expense"
                      name="Expenses"
                      fill="#ea384c"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No data available for this period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get consistent colors for categories
function getCategoryColor(categoryName: string) {
  const colorMap: Record<string, string> = {
    Income: "#4caf50",
    Housing: "#6E59A5",
    Food: "#F97316",
    Transportation: "#0EA5E9",
    Entertainment: "#9b87f5",
    Healthcare: "#ea384c",
    Education: "#8B5CF6",
    Shopping: "#D946EF",
    Utilities: "#0EA5E9",
  };
  
  return colorMap[categoryName] || "#6E59A5";
}
