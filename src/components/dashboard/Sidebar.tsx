import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronDown,
  Fuel
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  hasSubmenu?: boolean;
  expanded?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active, hasSubmenu, expanded, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "sidebar-nav-item w-full",
      active && "active"
    )}
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
    {hasSubmenu && (
      <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
    )}
  </button>
);

const SubNavItem = ({ label, active }: { label: string; active?: boolean }) => (
  <button
    className={cn(
      "w-full pl-12 pr-4 py-2 text-left text-sm text-sidebar-muted hover:text-sidebar-foreground transition-colors",
      active && "text-sidebar-accent font-medium"
    )}
  >
    {label}
  </button>
);

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const [ordersExpanded, setOrdersExpanded] = useState(true);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <aside 
        style={{ willChange: 'transform' }}
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-sidebar-bg flex flex-col z-50",
          "transform-gpu overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-sidebar-accent rounded-xl flex items-center justify-center">
          <Fuel className="w-6 h-6 text-sidebar-bg" />
        </div>
        <span className="text-xl font-bold text-sidebar-foreground">Fuely</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        <p className="px-4 py-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
          Main Menu
        </p>
        
        <NavItem 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          label="Dashboard" 
          active 
        />
        
        <NavItem 
          icon={<FileText className="w-5 h-5" />} 
          label="Orders" 
          hasSubmenu
          expanded={ordersExpanded}
          onClick={() => setOrdersExpanded(!ordersExpanded)}
        />
        
        {ordersExpanded && (
          <div className="animate-fade-in">
            <SubNavItem label="New" />
            <SubNavItem label="Pending" active />
            <SubNavItem label="In Progress" />
            <SubNavItem label="Completed" />
          </div>
        )}
        
        <NavItem 
          icon={<Package className="w-5 h-5" />} 
          label="Manage" 
          hasSubmenu
        />
        
        <NavItem 
          icon={<BarChart3 className="w-5 h-5" />} 
          label="Reporting" 
        />
        
        <NavItem 
          icon={<MessageSquare className="w-5 h-5" />} 
          label="Messages" 
        />
      </nav>

      {/* Preference Section */}
      <div className="px-4 py-4 border-t border-sidebar-muted/20">
        <p className="px-4 py-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
          Preference
        </p>
        <NavItem 
          icon={<Settings className="w-5 h-5" />} 
          label="Settings" 
        />
        <NavItem 
          icon={<HelpCircle className="w-5 h-5" />} 
          label="Help" 
        />
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-muted/20">
        <NavItem 
          icon={<LogOut className="w-5 h-5" />} 
          label="Log Out" 
        />
      </div>
    </aside>
    </>
  );
};
