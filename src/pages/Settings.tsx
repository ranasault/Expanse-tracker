
import { useState } from "react";
import { useExpenseStore } from "@/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Download, Plus, Save, Trash2, Upload } from "lucide-react";

export default function Settings() {
  const { categories, addCategory, updateCategory, deleteCategory } = useExpenseStore();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("tag");
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const categoryExists = categories.some(
      (c) => c.name.toLowerCase() === newCategoryName.toLowerCase()
    );

    if (categoryExists) {
      toast.error("This category already exists");
      return;
    }

    addCategory({
      name: newCategoryName,
      icon: newCategoryIcon,
    });

    toast.success("Category added successfully");
    setNewCategoryName("");
    setNewCategoryIcon("tag");
  };

  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id);
    setAlertDialogOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      const category = categories.find((c) => c.id === categoryToDelete);
      
      // Prevent deleting the Income category
      if (category && category.name === "Income") {
        toast.error("Cannot delete the Income category");
        setAlertDialogOpen(false);
        setCategoryToDelete(null);
        return;
      }
      
      deleteCategory(categoryToDelete);
      toast.success("Category deleted successfully");
      setAlertDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Export data as JSON
  const exportData = () => {
    const store = useExpenseStore.getState();
    const dataStr = JSON.stringify(store, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `expense-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Data exported successfully");
  };

  // Import data from JSON
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = e => {
        if (e.target?.result) {
          try {
            const data = JSON.parse(e.target.result as string);
            useExpenseStore.setState(data);
            toast.success("Data imported successfully");
          } catch (error) {
            toast.error("Failed to import data. Invalid format.");
          }
        }
      };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {/* Categories Management */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Categories Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="categoryIcon">Icon Name</Label>
                <Input
                  id="categoryIcon"
                  placeholder="Enter icon name"
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddCategory} className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Icon</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b last:border-b-0">
                      <td className="px-4 py-2">{category.name}</td>
                      <td className="px-4 py-2">{category.icon}</td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={category.name === "Income"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Data Management */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Button onClick={exportData} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              
              <div className="relative">
                <Input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* User Profile */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="John Doe" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="john@example.com" defaultValue="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" placeholder="USD" defaultValue="USD" />
            </div>
            <Button className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Category Alert Dialog */}
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This will affect all
              transactions that use this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
