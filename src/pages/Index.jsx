import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Fuel, 
  IndianRupee, 
  TrendingUp, 
  BarChart, 
  Percent, 
  ShoppingCart, 
  ShoppingBag, 
  Users 
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FilterSection } from "@/components/dashboard/FilterSection";
import { QuickInsights } from "@/components/dashboard/QuickInsights";
import { MonthlyPerformanceChart } from "@/components/dashboard/MonthlyPerformanceChart";
import { OverallSalesPieChart } from "@/components/dashboard/OverallSalesPieChart";
import { BunkeredSalesChart } from "@/components/dashboard/BunkeredSalesChart";
import { PPIChart } from "@/components/dashboard/PPIChart";
import { DateWiseChart } from "@/components/dashboard/DateWiseChart";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { InitialLandingState } from "@/components/dashboard/InitialLandingState";
import { CardDetailModal, DetailItem } from "@/components/dashboard/CardDetailModal";
import { TopPerformingSitesTable } from "@/components/dashboard/TopPerformingSitesTable";
import { MarketingInitiativesTable } from "@/components/dashboard/MarketingInitiativesTable";
import { SalesDistributionChart } from "@/components/dashboard/SalesDistributionChart";
import { SplineLoader } from "@/components/dashboard/SplineLoader";
import { CityMap } from "@/components/dashboard/CityMap";

const Index = () => {
  // Loading state for Spline animation - starts true on page load
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  // Track if loading has already completed to prevent re-triggering
  const loadingCompletedRef = useRef(false);

  // Initialize sidebar state based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024; // lg breakpoint
    }
    return true;
  });

  // Filter and landing state
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);

  // Modal states for card clicks
  const [fuelVolumeModalOpen, setFuelVolumeModalOpen] = useState(false);
  const [netSalesModalOpen, setNetSalesModalOpen] = useState(false);
  const [profitModalOpen, setProfitModalOpen] = useState(false);

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

  // Handle loading complete - fade in dashboard
  // Use useCallback to prevent re-creation and re-triggering
  const handleLoadingComplete = useCallback(() => {
    // Only proceed if loading hasn't already completed
    if (loadingCompletedRef.current) return;
    
    // Ensure DOM is ready before showing dashboard
    const showDashboard = () => {
      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        loadingCompletedRef.current = true;
        setIsLoading(false);
        // Smooth transition: wait for loader to fully fade out, then show dashboard
        requestAnimationFrame(() => {
          setTimeout(() => {
            setDashboardVisible(true);
          }, 300); // Small delay for smooth transition
        });
      });
    };

    // Wait for DOM and fonts to be ready
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
  
  const handleApplyFilters = () => {
    // Only apply filters if a specific site is selected
    if (!selectedSite || selectedSite === 'all') {
      return;
    }
    // Filters are applied in FilterSection component
    // This just sets the flag to show the dashboard
    setFiltersApplied(true);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Spline Loading Screen */}
      {isLoading && (
        <SplineLoader 
          onLoadingComplete={handleLoadingComplete}
          isLoading={isLoading}
        />
      )}

      {/* Main Dashboard - Animated Entry */}
      <div
        className={`transition-all duration-1200 ease-out ${
          dashboardVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-0 pointer-events-none'
        }`}
      >
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <main 
          style={{ willChange: 'margin-left' }}
          className={`transition-[margin-left] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} ml-0`}
        >
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
        
        <div className="p-4 lg:p-6">
          {/* Page Title */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">Business Performance Dashboard</h1>
          </div>

          {/* Filter Section */}
          <FilterSection 
            onApplyFilters={handleApplyFilters}
            selectedSite={selectedSite}
            onSiteChange={setSelectedSite}
            filtersApplied={filtersApplied}
          />

          {/* Initial Landing State - Show when filters not applied */}
          {!filtersApplied && (
            <InitialLandingState 
              onApplyFilters={handleApplyFilters}
              dashboardVisible={dashboardVisible}
            />
          )}

          {/* Main Dashboard - Show when filters applied */}
          {filtersApplied && (
            <>
          {/* Site Map - Show map for selected site */}
          <CityMap selectedSite={selectedSite || 'all'} />

          {/* Primary Metrics Grid - Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-4 lg:mb-6">
            <MetricCard
              title="Total Fuel Volume"
              value="130 M L"
              subtitle="Litres Sold"
              icon={Fuel}
              iconBg="blue"
              delay={0}
              chartType="bar"
              chartData={[30, 45, 35, 60, 50, 70, 65, 80]}
              onClick={() => setFuelVolumeModalOpen(true)}
            />
            <MetricCard
              title="Net Sales (Pounds)"
              value="£2 M"
              subtitle="Revenue generated"
              change="+12.5% vs last month"
              changeType="positive"
              icon={IndianRupee}
              iconBg="green"
              delay={50}
              chartType="line"
              chartData={[20, 30, 25, 40, 35, 50, 55, 70]}
              onClick={() => setNetSalesModalOpen(true)}
            />
            <MetricCard
              title="Profit (pounds)"
              value="£86.5 k"
              subtitle="Total Earnings"
              icon={TrendingUp}
              iconBg="purple"
              delay={100}
              chartType="line"
              chartData={[15, 25, 30, 35, 40, 50, 60, 75]}
              onClick={() => setProfitModalOpen(true)}
            />
            <MetricCard
              title="Avg PPL"
              value="6.02 p"
              subtitle="Profit Per liter"
              icon={BarChart}
              iconBg="orange"
              delay={150}
              chartType="bar"
              chartData={[40, 35, 50, 45, 55, 60, 50, 65]}
            />
          </div>

          {/* Secondary Metrics Grid - Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-4 lg:mb-6">
            <MetricCard
              title="Actual PPL"
              value="£78.5"         
              subtitle="Average"
              icon={Percent}
              iconBg="yellow"
              delay={200}
              chartType="bar"
              chartData={[45, 50, 40, 55, 48, 60, 52, 58]}
            />
            <MetricCard
              title="Labour cost as % per shop sales"
              value="16%"
              subtitle="per shop sales"
              icon={ShoppingCart}
              iconBg="pink"
              delay={250}
              chartType="line"
              chartData={[10, 12, 11, 14, 13, 15, 14, 16]}
            />
            <MetricCard
              title="Basket Size"
              value="₹425"
              subtitle="Average order value"
              icon={ShoppingBag}
              iconBg="yellow"
              delay={300}
              chartType="bar"
              chartData={[300, 350, 320, 400, 380, 420, 390, 425]}
            />
            <MetricCard
              title="Customer Count"
              value="12,450"
              subtitle="This month"
              icon={Users}
              iconBg="purple"
              delay={350}
              chartType="line"
              chartData={[8000, 9000, 9500, 10000, 10500, 11000, 11500, 12450]}
            />
          </div>

          {/* Status Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-6">
            <StatusCard 
              title="Bank Closing Balance" 
              value="£24,50,000" 
              delay={400}
            />
            <StatusCard 
              title="Debtors (Total)" 
              value="£1,20,000" 
              delay={425}
            />
            <StatusCard 
              title="Fuel Creditors" 
              value="£85,000" 
              delay={450}
            />
            <StatusCard 
              title="Fuel Condition" 
              value="Normal" 
              status="normal"
              delay={475}
            />
            <StatusCard 
              title="Discounts (Total /)" 
              value="£45,000" 
              delay={500}
            />
          </div>

          {/* Quick Insights */}
          <QuickInsights />

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <div className="lg:col-span-2">
              <MonthlyPerformanceChart />
            </div>
            <OverallSalesPieChart />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <BunkeredSalesChart />
            <PPIChart />
          </div>

          {/* Date-wise Chart */}
          <DateWiseChart 
            selectedMonths={selectedMonth ? [selectedMonth] : []}
          />

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <TopPerformingSitesTable />
            <MarketingInitiativesTable />
          </div>

          {/* Sales Distribution Chart */}
          <SalesDistributionChart />
            </>
          )}

          {/* Card Detail Modals */}
          <CardDetailModal
            open={fuelVolumeModalOpen}
            onOpenChange={setFuelVolumeModalOpen}
            title="Total Fuel Volume Breakdown"
          >
            <DetailItem 
              label="Total Bunkered volume" 
              value="1 M Liters" 
            />
            <DetailItem 
              label="Total Non-Bunkered Volume" 
              value="30k Liters" 
            />
          </CardDetailModal>

          <CardDetailModal
            open={netSalesModalOpen}
            onOpenChange={setNetSalesModalOpen}
            title="Net Sales Breakdown"
          >
            <DetailItem 
              label="Fuel Sales" 
              value="£143 M" 
              subValue="(Bunkered sales: 1M, Non-Bunkered sales: 43 K)"
            />
            <DetailItem 
              label="Shop Sales" 
              value="£40k" 
            />
            <DetailItem 
              label="Valet Sales" 
              value="£17k" 
            />
          </CardDetailModal>

          <CardDetailModal
            open={profitModalOpen}
            onOpenChange={setProfitModalOpen}
            title="Profit Breakdown"
          >
            <DetailItem 
              label="Fuel Profit" 
              value="£88.5k" 
            />
            <DetailItem 
              label="Bunkered Profit" 
              value="£7.7k" 
            />
            <DetailItem 
              label="Non-Bunkered Profit" 
              value="£9.5k" 
            />
            <DetailItem 
              label="Shop Profit" 
              value="£9k" 
            />
            <DetailItem 
              label="Valet Profit" 
              value="£4.5k" 
            />
          </CardDetailModal>
        </div>
      </main>
      </div>
    </div>
  );
};

export default Index;
