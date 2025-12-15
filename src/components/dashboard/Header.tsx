import { Search, Bell, Plus, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header = ({ sidebarOpen, onToggleSidebar }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Toggle Button & Search */}
      <div className="flex items-center gap-2 lg:gap-4 flex-1">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Menu className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        
        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders, transaction etc"
            className="pl-10 bg-background border-border w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:gap-4">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold hidden md:flex">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
        
        {/* Mobile: Just Plus Icon */}
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold md:hidden p-2">
          <Plus className="w-5 h-5" />
        </Button>

        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" />
          )}
        </button>

        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-border">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-primary to-chart-orange flex items-center justify-center">
            <span className="text-xs lg:text-sm font-bold text-primary-foreground">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
