
import { useState } from "react";
import { format } from "date-fns";
import { useExpenseStore } from "@/data/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { TransactionType } from "@/types";
import { toast } from "sonner";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddTransaction() {
  const navigate = useNavigate();
  const { categories, addTransaction } = useExpenseStore();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!amount || !description || !categoryId || !date) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Find selected category
    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      toast.error("Please select a valid category");
      return;
    }
    
    // Create transaction
    const transaction = {
      amount: parseFloat(amount),
      description,
      category,
      date: new Date(date),
      type,
    };
    
    // Add transaction to store
    addTransaction(transaction);
    
    // Show success message
    toast.success("Transaction added successfully");
    
    // Clear form
    setAmount("");
    setDescription("");
    setCategoryId("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    
    // Navigate to transactions page
    navigate("/transactions");
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Add Transaction</h1>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
          <CardDescription>
            Record a new transaction to track your finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={type} onValueChange={(value) => setType(value as TransactionType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="income" className="flex items-center gap-2">
                  <ArrowUpIcon className="h-4 w-4" />
                  Income
                </TabsTrigger>
                <TabsTrigger value="expense" className="flex items-center gap-2">
                  <ArrowDownIcon className="h-4 w-4" />
                  Expense
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="amount"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What was this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(c => type === 'income' ? c.name === 'Income' : c.name !== 'Income')
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/transactions')}>
                Cancel
              </Button>
              <Button type="submit">Add Transaction</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
