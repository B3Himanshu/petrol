import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Header = () => {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search orders, transaction etc"
          className="pl-10 bg-background border-border"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>

        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-orange flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
};
