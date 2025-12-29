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
import { dashboardAPI } from "@/services/api";

const Index = () => {
  // Check if this is the initial app load (first time in this session)
  // Only show animation on initial load, not when navigating between pages
  const isInitialLoad = !sessionStorage.getItem('appInitialized');
  
  // Loading state for Spline animation - only true on initial load
  const [isLoading, setIsLoading] = useState(isInitialLoad);
  const [dashboardVisible, setDashboardVisible] = useState(!isInitialLoad);
  // Track if loading has already completed to prevent re-triggering
  const loadingCompletedRef = useRef(!isInitialLoad);

  // Initialize sidebar state based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024; // lg breakpoint
    }
    return true;
  });

  // Load saved filters from sessionStorage on mount
  const loadSavedFilters = () => {
    try {
      const saved = sessionStorage.getItem('dashboardFilters');
      if (saved) {
        const filters = JSON.parse(saved);
        return {
          site: filters.site || null,
          months: filters.months || [11],
          years: filters.years || [2025],
          month: filters.month || 11,
          year: filters.year || 2025,
          applied: filters.applied || false
        };
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
    return {
      site: null,
      months: [11],
      years: [2025],
      month: 11,
      year: 2025,
      applied: false
    };
  };

  const savedFilters = loadSavedFilters();
  
  // Filter and landing state - initialize from saved filters
  const [filtersApplied, setFiltersApplied] = useState(savedFilters.applied);
  const [selectedMonth, setSelectedMonth] = useState(savedFilters.month);
  const [selectedYear, setSelectedYear] = useState(savedFilters.year);
  const [selectedMonths, setSelectedMonths] = useState(savedFilters.months);
  const [selectedYears, setSelectedYears] = useState(savedFilters.years);
  const [selectedSite, setSelectedSite] = useState(savedFilters.site);
  const pendingSiteIdRef = useRef(null);

  // Dashboard data state
  const [metrics, setMetrics] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [salesDistribution, setSalesDistribution] = useState(null);

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
    
    // Mark app as initialized in session storage
    sessionStorage.setItem('appInitialized', 'true');
    
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
  
  const handleApplyFilters = useCallback((filters) => {
    // filters can be either { siteId, months, years } or { siteId, month, year } or just siteId (for backward compatibility)
    const siteId = typeof filters === 'object' ? filters.siteId : filters;
    const months = typeof filters === 'object' ? (filters.months || (filters.month ? [filters.month] : null)) : null;
    const years = typeof filters === 'object' ? (filters.years || (filters.year ? [filters.year] : null)) : null;
    
    // Only apply filters if a specific site is selected
    if (!siteId || siteId === 'all') {
      return;
    }
    
    // Store the siteId and set it - useEffect will handle setting filtersApplied
    pendingSiteIdRef.current = siteId;
    setSelectedSite(siteId);
    
    // Set months and years if provided (use first month/year for single selection compatibility)
    const finalMonths = months && months.length > 0 ? months : selectedMonths;
    const finalYears = years && years.length > 0 ? years : selectedYears;
    
    if (finalMonths && finalMonths.length > 0) {
      setSelectedMonth(finalMonths[0]); // For backward compatibility, use first month
      // Store all months for multi-select support
      setSelectedMonths(finalMonths);
    }
    if (finalYears && finalYears.length > 0) {
      setSelectedYear(finalYears[0]); // For backward compatibility, use first year
      // Store all years for multi-select support
      setSelectedYears(finalYears);
    }
    
    // Save filters to sessionStorage
    try {
      sessionStorage.setItem('dashboardFilters', JSON.stringify({
        site: siteId,
        months: finalMonths,
        years: finalYears,
        month: finalMonths[0],
        year: finalYears[0],
        applied: true
      }));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }, [selectedMonths, selectedYears]);
  
  // Effect to set filtersApplied after selectedSite is confirmed
  useEffect(() => {
    if (pendingSiteIdRef.current && selectedSite === pendingSiteIdRef.current) {
      setFiltersApplied(true);
      pendingSiteIdRef.current = null;
    }
  }, [selectedSite]);

  // Restore saved filters on mount if they exist
  useEffect(() => {
    if (savedFilters.applied && savedFilters.site) {
      // Auto-apply saved filters
      setSelectedSite(savedFilters.site);
      setSelectedMonths(savedFilters.months);
      setSelectedYears(savedFilters.years);
      setSelectedMonth(savedFilters.month);
      setSelectedYear(savedFilters.year);
      setFiltersApplied(true);
    }
  }, []); // Only run on mount

  // Fetch dashboard metrics when site is selected
  useEffect(() => {
    if (!selectedSite || selectedSite === 'all' || !filtersApplied) {
      setMetrics(null);
      setStatusData(null);
      setSalesDistribution(null);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoadingMetrics(true);
        
        // Ensure siteId is a number (convert from string if needed)
        const siteIdNum = typeof selectedSite === 'string' ? parseInt(selectedSite, 10) : selectedSite;
        
        // Use selected months and years arrays, fallback to single values for backward compatibility
        const monthsToFetch = selectedMonths && selectedMonths.length > 0 ? selectedMonths : [selectedMonth || new Date().getMonth() + 1];
        const yearsToFetch = selectedYears && selectedYears.length > 0 ? selectedYears : [selectedYear || new Date().getFullYear()];
        
        console.log('🔄 [Index] Fetching dashboard data:', {
          siteId: selectedSite,
          siteIdNum,
          monthsToFetch,
          yearsToFetch,
          monthsCount: monthsToFetch.length,
          yearsCount: yearsToFetch.length,
          timestamp: new Date().toISOString()
        });
        
        // Fetch metrics, status, and sales distribution in parallel
        // Pass arrays to API which will aggregate data across all months/years
        console.log('🔄 [Index] Starting parallel API calls...');
        const [metricsData, statusDataResult, salesData] = await Promise.all([
          dashboardAPI.getMetrics(siteIdNum, monthsToFetch, yearsToFetch),
          dashboardAPI.getStatus(siteIdNum),
          dashboardAPI.getSalesDistribution(siteIdNum, monthsToFetch, yearsToFetch),
        ]);

        console.log('✅ [Index] Dashboard data received:', {
          metricsData: {
            totalFuelVolume: metricsData?.totalFuelVolume,
            netSales: metricsData?.netSales,
            profit: metricsData?.profit,
            avgPPL: metricsData?.avgPPL,
            customerCount: metricsData?.customerCount
          },
          statusData: statusDataResult,
          salesData: salesData,
          timestamp: new Date().toISOString()
        });
        
        setMetrics(metricsData);
        setStatusData(statusDataResult);
        setSalesDistribution(salesData);
      } catch (error) {
        console.error('❌ [Index] Error fetching dashboard data:', {
          error: error.message,
          stack: error.stack,
          selectedSite,
          selectedMonths,
          selectedYears,
          selectedMonth,
          selectedYear,
          filtersApplied,
          timestamp: new Date().toISOString()
        });
        setMetrics(null);
        setStatusData(null);
        setSalesDistribution(null);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchDashboardData();
  }, [selectedSite, selectedMonths, selectedYears, selectedMonth, selectedYear, filtersApplied]);

  // Format number helpers
  const formatVolume = (liters) => {
    if (!liters) return "0 L";
    if (liters >= 1000000) return `${(liters / 1000000).toFixed(1)} M L`;
    if (liters >= 1000) return `${(liters / 1000).toFixed(0)} K L`;
    return `${liters.toFixed(0)} L`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return "£0";
    if (amount >= 1000000) return `£${(amount / 1000000).toFixed(1)} M`;
    if (amount >= 1000) return `£${(amount / 1000).toFixed(1)} k`;
    return `£${amount.toFixed(0)}`;
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return num.toLocaleString();
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

      {/* Sidebar - Outside transition container to ensure fixed positioning */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Dashboard - Animated Entry */}
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
          totalSales={metrics?.netSales}
        />
        
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
          {filtersApplied && selectedSite && (
            <>
          {/* Site Map - Show map for selected site */}
          <CityMap selectedSite={selectedSite} />

          {/* Primary Metrics Grid - Row 1 */}
          {loadingMetrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-4 lg:mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="chart-card animate-pulse h-32" />
              ))}
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-4 lg:mb-6">
              <MetricCard
                title="Total Fuel Volume"
                value={formatVolume(metrics.totalFuelVolume)}
                subtitle="Litres Sold"
                icon={Fuel}
                iconBg="blue"
                delay={0}
                chartType="bar"
                chartData={[]} // Chart data would come from daily/monthly breakdown
                onClick={() => setFuelVolumeModalOpen(true)}
              />
              <MetricCard
                title="Net Sales (Pounds)"
                value={formatCurrency(metrics.netSales)}
                subtitle="Revenue generated"
                icon={IndianRupee}
                iconBg="green"
                delay={50}
                chartType="line"
                chartData={[]} // Chart data would come from daily/monthly breakdown
                onClick={() => setNetSalesModalOpen(true)}
              />
              <MetricCard
                title="Profit (pounds)"
                value={formatCurrency(metrics.profit)}
                subtitle="Total Earnings"
                icon={TrendingUp}
                iconBg="purple"
                delay={100}
                chartType="line"
                chartData={[]} // Chart data would come from daily/monthly breakdown
                onClick={() => setProfitModalOpen(true)}
              />
              <MetricCard
                title="Avg PPL"
                value={`${metrics.avgPPL?.toFixed(2) || '0.00'} p`}
                subtitle="Profit Per liter"
                icon={BarChart}
                iconBg="orange"
                delay={150}
                chartType="bar"
                chartData={[]} // Chart data would come from daily/monthly breakdown
              />
            </div>
          ) : null}

          {/* Secondary Metrics Grid - Row 2 */}
          {metrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-4 lg:mb-6">
              <MetricCard
                title="Actual PPL"
                value={formatCurrency(metrics.actualPPL)}         
                subtitle="Average"
                icon={Percent}
                iconBg="yellow"
                delay={200}
                chartType="bar"
                chartData={[]}
              />
              <MetricCard
                title="Labour cost as % per shop sales"
                value={`${metrics.labourCostPercent?.toFixed(1) || '0'}%`}
                subtitle="per shop sales"
                icon={ShoppingCart}
                iconBg="pink"
                delay={250}
                chartType="line"
                chartData={[]}
              />
              <MetricCard
                title="Basket Size"
                value={formatCurrency(metrics.basketSize)}
                subtitle="Average order value"
                icon={ShoppingBag}
                iconBg="yellow"
                delay={300}
                chartType="bar"
                chartData={[]}
              />
              <MetricCard
                title="Customer Count"
                value={formatNumber(metrics.customerCount)}
                subtitle="This month"
                icon={Users}
                iconBg="purple"
                delay={350}
                chartType="line"
                chartData={[]}
              />
            </div>
          ) : null}

          {/* Status Cards Row */}
          {statusData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-6">
              <StatusCard 
                title="Bank Closing Balance" 
                value={formatCurrency(statusData.bankClosingBalance)} 
                delay={400}
              />
              <StatusCard 
                title="Debtors (Total)" 
                value={formatCurrency(statusData.debtorsTotal)} 
                delay={425}
              />
              <StatusCard 
                title="Fuel Creditors" 
                value={formatCurrency(statusData.fuelCreditors)} 
                delay={450}
              />
              <StatusCard 
                title="Fuel Condition" 
                value={statusData.fuelCondition || "Normal"} 
                status="normal"
                delay={475}
              />
              <StatusCard 
                title="Discounts (Total /)" 
                value={formatCurrency(statusData.discountsTotal)} 
                delay={500}
              />
            </div>
          ) : null}

          {/* Quick Insights */}
          <QuickInsights />

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <div className="lg:col-span-2">
              <MonthlyPerformanceChart 
                siteId={selectedSite} 
                month={selectedMonth}
                months={selectedMonths.length > 0 ? selectedMonths : [selectedMonth]} 
                year={selectedYear}
                years={selectedYears.length > 0 ? selectedYears : [selectedYear]} 
              />
            </div>
            <OverallSalesPieChart 
              siteId={selectedSite} 
              month={selectedMonth}
              months={selectedMonths.length > 0 ? selectedMonths : [selectedMonth]} 
              year={selectedYear}
              years={selectedYears.length > 0 ? selectedYears : [selectedYear]} 
            />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <BunkeredSalesChart 
              siteId={selectedSite} 
              month={selectedMonth}
              months={selectedMonths.length > 0 ? selectedMonths : [selectedMonth]} 
              year={selectedYear}
              years={selectedYears.length > 0 ? selectedYears : [selectedYear]} 
            />
            <PPIChart 
              siteId={selectedSite} 
              month={selectedMonth}
              months={selectedMonths.length > 0 ? selectedMonths : [selectedMonth]} 
              year={selectedYear}
              years={selectedYears.length > 0 ? selectedYears : [selectedYear]} 
            />
          </div>

          {/* Date-wise Chart */}
          <DateWiseChart 
            siteId={selectedSite}
            selectedMonths={selectedMonths.length > 0 ? selectedMonths : (selectedMonth ? [selectedMonth] : [])}
            years={selectedYears.length > 0 ? selectedYears : [selectedYear]}
          />

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <TopPerformingSitesTable 
              siteId={selectedSite} 
              month={selectedMonth}
              months={selectedMonths.length > 0 ? selectedMonths : [selectedMonth]} 
              year={selectedYear}
              years={selectedYears.length > 0 ? selectedYears : [selectedYear]} 
            />
            <MarketingInitiativesTable 
              siteId={selectedSite} 
              month={selectedMonth}
              months={selectedMonths.length > 0 ? selectedMonths : [selectedMonth]} 
              year={selectedYear}
              years={selectedYears.length > 0 ? selectedYears : [selectedYear]} 
            />
          </div>

          {/* Sales Distribution Chart */}
          <SalesDistributionChart 
            siteId={selectedSite} 
            month={selectedMonth}
            months={selectedMonths.length > 0 ? selectedMonths : [selectedMonth]} 
            year={selectedYear}
            years={selectedYears.length > 0 ? selectedYears : [selectedYear]} 
          />
            </>
          )}

          {/* Card Detail Modals */}
          <CardDetailModal
            open={fuelVolumeModalOpen}
            onOpenChange={setFuelVolumeModalOpen}
            title="Total Fuel Volume Breakdown"
          >
            {metrics ? (
              <>
                <DetailItem 
                  label="Total Fuel Volume" 
                  value={formatVolume(metrics.totalFuelVolume || 0)} 
                  subValue="All fuel sold"
                />
                <DetailItem 
                  label="Bunkered Volume" 
                  value={formatVolume(metrics.bunkeredVolume || 0)} 
                  subValue="From storage tanks"
                />
                <DetailItem 
                  label="Non-Bunkered Volume" 
                  value={formatVolume(metrics.nonBunkeredVolume || 0)} 
                  subValue="Direct delivery"
                />
              </>
            ) : (
              <DetailItem label="Loading..." value="Please wait" />
            )}
          </CardDetailModal>

          <CardDetailModal
            open={netSalesModalOpen}
            onOpenChange={setNetSalesModalOpen}
            title="Net Sales Breakdown"
          >
            {metrics ? (
              <>
                <DetailItem 
                  label="Total Fuel Sales" 
                  value={formatCurrency((metrics.bunkeredSales || 0) + (metrics.nonBunkeredSales || 0))} 
                  subValue={`Bunkered: ${formatCurrency(metrics.bunkeredSales || 0)} + Non-Bunkered: ${formatCurrency(metrics.nonBunkeredSales || 0)}`}
                />
                <DetailItem 
                  label="Shop Sales" 
                  value={formatCurrency(metrics.shopSales || 0)} 
                />
                <DetailItem 
                  label="Valet Sales" 
                  value={formatCurrency(metrics.valetSales || 0)} 
                />
                <DetailItem 
                  label="Net Sales (Total)" 
                  value={formatCurrency(metrics.netSales || 0)} 
                  subValue="Sum of all sales"
                />
              </>
            ) : (
              <DetailItem label="Loading..." value="Please wait" />
            )}
          </CardDetailModal>

          <CardDetailModal
            open={profitModalOpen}
            onOpenChange={setProfitModalOpen}
            title="Profit Breakdown"
          >
            {metrics ? (
              <>
                <DetailItem 
                  label="Total Profit" 
                  value={formatCurrency(metrics.profit || 0)} 
                  subValue="Sum of all profits"
                />
                <DetailItem 
                  label="Fuel Profit" 
                  value={formatCurrency(metrics.fuelProfit || 0)} 
                  subValue={`Sales: ${formatCurrency((metrics.bunkeredSales || 0) + (metrics.nonBunkeredSales || 0))} - Purchases: ${formatCurrency((metrics.bunkeredPurchases || 0) + (metrics.nonBunkeredPurchases || 0))}`}
                />
                <DetailItem 
                  label="Shop Profit" 
                  value={formatCurrency(metrics.shopProfit || 0)} 
                  subValue={`Sales: ${formatCurrency(metrics.shopSales || 0)} - Purchases: ${formatCurrency(metrics.shopPurchases || 0)}`}
                />
                <DetailItem 
                  label="Valet Profit" 
                  value={formatCurrency(metrics.valetProfit || 0)} 
                  subValue={`Sales: ${formatCurrency(metrics.valetSales || 0)} - Purchases: ${formatCurrency(metrics.valetPurchases || 0)}`}
                />
                <DetailItem 
                  label="Overheads" 
                  value={formatCurrency(metrics.overheads || 0)} 
                  subValue="Operating costs"
                />
                <DetailItem 
                  label="Labour Cost" 
                  value={formatCurrency(metrics.labourCost || 0)} 
                  subValue={`${metrics.labourCostPercent?.toFixed(1) || 0}% of shop sales`}
                />
              </>
            ) : (
              <DetailItem label="Loading..." value="Please wait" />
            )}
          </CardDetailModal>
        </div>
      </main>
      </div>
    </div>
  );
};

export default Index;
