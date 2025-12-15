import { useState, useEffect } from "react";
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
import { OrdersDonutChart } from "@/components/dashboard/OrdersDonutChart";
import { BunkeredSalesChart } from "@/components/dashboard/BunkeredSalesChart";
import { PPIChart } from "@/components/dashboard/PPIChart";
import { DateWiseChart } from "@/components/dashboard/DateWiseChart";
import { StatusCard } from "@/components/dashboard/StatusCard";

const Index = () => {
  // Initialize sidebar state based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024; // lg breakpoint
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

  return (
    <div className="min-h-screen bg-background">
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
          <FilterSection />

          {/* Primary Metrics Grid - Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-4 lg:mb-6">
            <MetricCard
              title="Total Fuel Volume"
              value="1.56 M L"
              subtitle="Litres Sold"
              icon={Fuel}
              iconBg="blue"
              delay={0}
              chartType="bar"
              chartData={[30, 45, 35, 60, 50, 70, 65, 80]}
            />
            <MetricCard
              title="Net Sales (Rupees)"
              value="₹2 M"
              subtitle="Revenue generated"
              change="+12.5% vs last month"
              changeType="positive"
              icon={IndianRupee}
              iconBg="green"
              delay={50}
              chartType="line"
              chartData={[20, 30, 25, 40, 35, 50, 55, 70]}
            />
            <MetricCard
              title="Profit (rupees)"
              value="₹5.5 Cr"
              subtitle="Net Earnings"
              icon={TrendingUp}
              iconBg="purple"
              delay={100}
              chartType="line"
              chartData={[15, 25, 30, 35, 40, 50, 60, 75]}
            />
            <MetricCard
              title="Avg PPI"
              value="84.0 /-"
              subtitle="Per litre for this year"
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
              title="Actual PO"
              value="₹78.5"
              subtitle="Average"
              icon={Percent}
              iconBg="yellow"
              delay={200}
              chartType="bar"
              chartData={[45, 50, 40, 55, 48, 60, 52, 58]}
            />
            <MetricCard
              title="Unique Cost Customers"
              value="16"
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
              value="₹24,50,000" 
              delay={400}
            />
            <StatusCard 
              title="Fuel Condition" 
              value="Normal" 
              status="normal"
              delay={450}
            />
            <StatusCard 
              title="Discounts (Total /)" 
              value="₹45,000" 
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
            <OrdersDonutChart />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <BunkeredSalesChart />
            <PPIChart />
          </div>

          {/* Date-wise Chart */}
          <DateWiseChart />
        </div>
      </main>
    </div>
  );
};

export default Index;
