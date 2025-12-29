import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";
import { dashboardAPI } from "@/services/api";

// Custom Tooltip component with theme-aware colors
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="rounded-lg p-3 shadow-xl min-w-[180px]"
        style={{
          backgroundColor: "hsl(222, 47%, 11%)",
          border: "1px solid hsl(217, 33%, 17%)",
          color: "#ffffff",
          zIndex: 99999,
        }}
      >
        <p className="font-semibold text-sm mb-2" style={{ color: "#ffffff" }}>
          {payload[0].name}
        </p>
        <p className="text-sm font-medium" style={{ color: "#ffffff" }}>
          Sales: £{payload[0].value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const colorMap = {
  "Fuel Sales": "#3b82f6",
  "Bunkered Sales": "#3b82f6",
  "Non-bunkered Sales": "#10b981",
  "Shop Sales": "#f59e0b",
  "Valet Sales": "#8b5cf6",
};

export const OverallSalesPieChart = ({ siteId, month, months, year, years }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!siteId || siteId === 'all') {
      setChartData([]);
      return;
    }

    // Use months/years arrays if provided, otherwise use single values
    // Handle both array and single value props for flexibility
    const monthsToUse = (months && Array.isArray(months) && months.length > 0) 
      ? months 
      : (month ? [month] : []);
    
    const yearsToUse = (years && Array.isArray(years) && years.length > 0) 
      ? years 
      : (year ? [year] : []);

    if (monthsToUse.length === 0 || yearsToUse.length === 0) {
      setChartData([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('📊 [OverallSalesPieChart] Fetching data:', {
          siteId,
          months: monthsToUse,
          years: yearsToUse,
        });
        
        // Get aggregated sales distribution across all selected months/years
        const data = await dashboardAPI.getSalesDistribution(siteId, monthsToUse, yearsToUse);
        
        console.log('📊 [OverallSalesPieChart] Received data:', data);
        
        // Filter out Shop Sales and Valet Sales - only show Fuel Sales
        // Also filter out any items with zero or very small values
        const filteredData = data.filter(item => 
          item.name !== "Shop Sales" && 
          item.name !== "Valet Sales" &&
          item.value > 0.01 // Only include items with meaningful values
        );
        
        // Transform API data to chart format with colors
        const transformed = filteredData.map((item) => ({
          name: item.name,
          value: item.value,
          color: colorMap[item.name] || "#8884d8"
        }));
        
        setChartData(transformed);
      } catch (error) {
        console.error('❌ [OverallSalesPieChart] Error fetching sales data:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId, month, months, year, years]);
  if (loading) {
    return (
      <div className="chart-card h-[420px] animate-slide-up" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-card h-[420px] animate-slide-up" style={{ animationDelay: "400ms" }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Overall Sales (Pie Chart)
        </h3>
        <div className="flex items-center justify-center h-[320px]">
          <div className="text-muted-foreground">No data available</div>
        </div>
      </div>
    );
  }

  // Calculate total for center label
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const hasMultipleSegments = chartData.length > 1;

  // Format total for display
  const formatTotal = (value) => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `£${(value / 1000).toFixed(0)}k`;
    }
    return `£${value.toFixed(0)}`;
  };

  return (
    <div className="chart-card h-[420px] animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Overall Sales</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Sales distribution breakdown</p>
          </div>
        </div>
        <div className="text-sm font-semibold text-foreground">
          Total: £{total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      
      <div className="h-[280px] relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              innerRadius={70}
              outerRadius={120}
              paddingAngle={hasMultipleSegments ? 3 : 0}
              fill="#8884d8"
              dataKey="value"
              stroke="hsl(var(--card))"
              strokeWidth={3}
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.filter = 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25)) brightness(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))';
                  }}
                />
              ))}
            </Pie>
            {/* Center label showing total - improved styling */}
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="hsl(var(--foreground))"
              fontSize={14}
              fontWeight={600}
              style={{
                opacity: 0.9,
              }}
            >
              Total Sales
            </text>
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="hsl(var(--foreground))"
              fontSize={20}
              fontWeight={700}
              style={{
                letterSpacing: '-0.02em',
              }}
            >
              {formatTotal(total)}
            </text>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={50}
              wrapperStyle={{ paddingTop: "15px" }}
              iconType="circle"
              iconSize={10}
              formatter={(value, entry) => {
                const item = chartData.find(d => d.name === value);
                const percentage = item ? ((item.value / total) * 100).toFixed(1) : '0.0';
                return (
                  <span className="text-sm font-medium text-foreground">
                    <span style={{ color: entry.color, fontWeight: 600 }}>{value}</span>
                    <span className="ml-2 text-muted-foreground">({percentage}%)</span>
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

