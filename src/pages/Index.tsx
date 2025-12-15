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
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Business Performance Dashboard</h1>
          </div>

          {/* Filter Section */}
          <FilterSection />

          {/* Primary Metrics Grid - Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <MetricCard
              title="Total Fuel Volume"
              value="1.56 M L"
              subtitle="Litres Sold"
              icon={Fuel}
              iconBg="blue"
              delay={0}
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
            />
            <MetricCard
              title="Profit (rupees)"
              value="₹5.5 Cr"
              subtitle="Net Earnings"
              icon={TrendingUp}
              iconBg="purple"
              delay={100}
            />
            <MetricCard
              title="Avg PPI"
              value="84.0 /-"
              subtitle="Per litre for this year"
              icon={BarChart}
              iconBg="orange"
              delay={150}
            />
          </div>

          {/* Secondary Metrics Grid - Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <MetricCard
              title="Actual PO"
              value="₹78.5"
              subtitle="Average"
              icon={Percent}
              iconBg="yellow"
              delay={200}
            />
            <MetricCard
              title="Unique Cost Customers"
              value="16"
              subtitle="per shop sales"
              icon={ShoppingCart}
              iconBg="pink"
              delay={250}
            />
            <MetricCard
              title="Basket Size"
              value="₹425"
              subtitle="Average order value"
              icon={ShoppingBag}
              iconBg="yellow"
              delay={300}
            />
            <MetricCard
              title="Customer Count"
              value="12,450"
              subtitle="This month"
              icon={Users}
              iconBg="purple"
              delay={350}
            />
          </div>

          {/* Status Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <MonthlyPerformanceChart />
            </div>
            <OrdersDonutChart />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
