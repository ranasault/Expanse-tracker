
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Home, 
  PieChart, 
  PlusCircle, 
  Settings, 
  Wallet 
} from "lucide-react";

type SidebarItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const sidebarItems: SidebarItem[] = [
    {
      name: "Dashboard",
      path: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      name: "Add Transaction",
      path: "/add-transaction",
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      name: "Budget",
      path: "/budget",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-border flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-expense-purple flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          Expense<span className="text-expense-light-purple">Tracker</span>
        </h1>
      </div>
      
      <div className="flex-1 py-8">
        <ul className="space-y-2 px-2">
          {sidebarItems.map((item) => (
            <li key={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-base font-normal",
                  location.pathname === item.path
                    ? "bg-accent text-white hover:bg-accent hover:text-white"
                    : "text-gray-600 hover:text-accent hover:bg-accent/10"
                )}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                {item.name}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 py-2">
          <div className="h-10 w-10 rounded-full bg-expense-light-purple/20 flex items-center justify-center text-expense-purple">
            JD
          </div>
          <div>
            <p className="font-medium">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
