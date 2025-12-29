import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { SplineLoader } from "@/components/dashboard/SplineLoader";
import { SiteComparison } from "@/components/comparison/SiteComparison";
import { sitesAPI, dashboardAPI } from "@/services/api";
import { GitCompare } from "lucide-react";

const Comparison = () => {
  // Check if this is the initial app load (first time in this session)
  // Only show animation on initial load, not when navigating between pages
  const isInitialLoad = !sessionStorage.getItem('appInitialized');
  
  // Loading state for Spline animation - only true on initial load
  const [isLoading, setIsLoading] = useState(isInitialLoad);
  const [dashboardVisible, setDashboardVisible] = useState(!isInitialLoad);
  const loadingCompletedRef = { current: !isInitialLoad };
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Handle responsive sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle loading complete - only on initial load
  useEffect(() => {
    if (loadingCompletedRef.current) return;
    
    // Mark app as initialized in session storage
    sessionStorage.setItem('appInitialized', 'true');
    
    const showDashboard = () => {
      requestAnimationFrame(() => {
        loadingCompletedRef.current = true;
        setIsLoading(false);
        requestAnimationFrame(() => {
          setTimeout(() => {
            setDashboardVisible(true);
          }, 300);
        });
      });
    };

    if (document.readyState === 'complete') {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          showDashboard();
        }).catch(() => {
          setTimeout(showDashboard, 50);
        });
      } else {
        setTimeout(showDashboard, 50);
      }
    } else if (document.readyState === 'interactive') {
      window.addEventListener('load', () => {
        setTimeout(showDashboard, 50);
      }, { once: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(showDashboard, 100);
      }, { once: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Spline Loading Screen */}
      {isLoading && (
        <SplineLoader 
          onLoadingComplete={() => setIsLoading(false)}
          isLoading={isLoading}
        />
      )}

      {/* Sidebar - Outside transition container to ensure fixed positioning */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content - Animated Entry */}
      <div
        className={`transition-all duration-1200 ease-out ${
          dashboardVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-0 pointer-events-none'
        }`}
      >
        <main 
          style={{ willChange: 'margin-left' }}
          className={`transition-[margin-left] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} ml-0`}
        >
          <Header 
            sidebarOpen={sidebarOpen} 
            onToggleSidebar={toggleSidebar} 
            totalSales={0}
          />
          
          <div className="p-4 lg:p-6">
            {/* Page Title */}
            <div className="mb-4 lg:mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GitCompare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">Site Comparison</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Compare performance metrics between two sites</p>
              </div>
            </div>

            {/* Comparison Component */}
            <SiteComparison />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Comparison;

