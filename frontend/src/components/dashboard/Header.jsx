import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const Header = ({ sidebarOpen, onToggleSidebar, totalSales }) => {
  const { theme, toggleTheme } = useTheme();

  // Format total sales value
  const formatTotalSales = (amount) => {
    if (!amount) return { number: "0", unit: "" };
    if (amount >= 1000000) {
      return { number: (amount / 1000000).toFixed(2), unit: "M" };
    }
    if (amount >= 1000) {
      return { number: (amount / 1000).toFixed(2), unit: "K" };
    }
    return { number: amount.toFixed(2), unit: "" };
  };

  const salesFormatted = formatTotalSales(totalSales || 0);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Spacer for layout */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Total Sales - Yellow Button Style */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold shadow-sm" style={{ backgroundColor: '#FFA500', color: '#000000' }}>
          <span className="text-sm font-semibold text-black">Total Sales:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium text-black/70">£</span>
            <span className="text-base font-bold text-black">{salesFormatted.number}</span>
            {salesFormatted.unit && <span className="text-sm font-semibold" style={{ color: '#4A90E2' }}>{salesFormatted.unit}</span>}
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
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
            <span className="text-xs lg:text-sm font-bold text-primary-foreground">
              JD
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


