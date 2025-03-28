
import { useState } from "react";
import { useExpenseStore } from "@/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Budget() {
  const { budgets, categories, addBudget, updateBudget, deleteBudget } = useExpenseStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");

  const handleOpenDialog = (editing = false, budget = null) => {
    setIsEditing(editing);
    if (editing && budget) {
      setEditId(budget.id);
      setCategoryId(budget.category.id);
      setAmount(budget.amount.toString());
      setPeriod(budget.period);
    } else {
      setEditId(null);
      setCategoryId("");
      setAmount("");
      setPeriod("monthly");
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!categoryId || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      toast.error("Please select a valid category");
      return;
    }

    if (isEditing && editId) {
      updateBudget(editId, {
        category,
        amount: parseFloat(amount),
        period,
      });
      toast.success("Budget updated successfully");
    } else {
      addBudget({
        category,
        amount: parseFloat(amount),
        period,
      });
      toast.success("Budget added successfully");
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteBudget(id);
    toast.success("Budget deleted successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Budget</h1>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.amount) * 100;
          const isOverBudget = percentage > 100;
          
          return (
            <Card key={budget.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{budget.category.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(true, budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} limit
                    </span>
                    <span className="font-medium">${budget.amount.toFixed(2)}</span>
                  </div>
                  
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={cn(isOverBudget ? "bg-expense-red/20" : "")}
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Spent: ${budget.spent.toFixed(2)}
                    </span>
                    <span 
                      className={`text-sm font-medium ${
                        isOverBudget ? "text-expense-red" : "text-expense-green"
                      }`}
                    >
                      {isOverBudget 
                        ? `Overbudget by $${(budget.spent - budget.amount).toFixed(2)}` 
                        : `${percentage.toFixed(0)}% used`
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {budgets.length === 0 && (
          <Card className="glass-card col-span-1 md:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No budgets set up yet</p>
              <Button 
                onClick={() => handleOpenDialog()} 
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Budget Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Budget" : "Add Budget"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update your budget limit for this category" 
                : "Set a budget limit for a specific category"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(c => c.name !== 'Income')
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Budget Limit</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="period">Time Period</Label>
              <Select value={period} onValueChange={(value) => setPeriod(value as "daily" | "weekly" | "monthly")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
