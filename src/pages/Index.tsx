import { Users, ShoppingCart, TrendingUp, Package, DollarSign, BarChart } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesSummaryChart } from "@/components/dashboard/SalesSummaryChart";
import { ProductSummaryChart } from "@/components/dashboard/ProductSummaryChart";
import { OrdersDonutChart } from "@/components/dashboard/OrdersDonutChart";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <MetricCard
              title="Total Users"
              value="7,320"
              icon={Users}
              iconBg="blue"
              sparkline={[30, 45, 35, 50, 40, 60, 55]}
              delay={0}
            />
            <MetricCard
              title="Total Orders"
              value="19,320"
              icon={ShoppingCart}
              iconBg="purple"
              sparkline={[40, 30, 55, 45, 60, 50, 70]}
              delay={50}
            />
            <MetricCard
              title="Total Sales"
              value="₹20,320"
              subtitle="Revenue generated"
              change="+12.5% vs last month"
              changeType="positive"
              icon={TrendingUp}
              iconBg="green"
              delay={100}
            />
            <MetricCard
              title="Total Pending"
              value="7,320"
              icon={Package}
              iconBg="orange"
              sparkline={[25, 35, 30, 45, 35, 55, 45]}
              delay={150}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SalesSummaryChart />
            <div className="grid grid-cols-2 gap-5">
              <MetricCard
                title="Basket Size"
                value="₹425"
                subtitle="Average order value"
                icon={DollarSign}
                iconBg="yellow"
                delay={200}
              />
              <MetricCard
                title="Customer Count"
                value="12,450"
                subtitle="This month"
                change="+8.3% vs last month"
                changeType="positive"
                icon={Users}
                iconBg="pink"
                delay={250}
              />
              <MetricCard
                title="Avg PPI"
                value="84.0/-"
                subtitle="Per litre for this year"
                icon={BarChart}
                iconBg="purple"
                delay={300}
              />
              <MetricCard
                title="Profit"
                value="₹5.5 Cr"
                subtitle="Net earnings"
                change="+15.2% vs last month"
                changeType="positive"
                icon={TrendingUp}
                iconBg="green"
                delay={350}
              />
            </div>
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductSummaryChart />
            <OrdersDonutChart />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
