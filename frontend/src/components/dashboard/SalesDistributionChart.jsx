import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { dashboardAPI } from "@/services/api";

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#f97316", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f43f5e", "#a855f7"];

// Custom Tooltip component with white text
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
          pointerEvents: 'none',
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
        }}
      >
        <p 
          className="font-semibold text-sm mb-1"
          style={{ color: "#ffffff" }}
        >
          {payload[0].name}
        </p>
        <p 
          className="font-bold text-base"
          style={{ color: "#ffffff" }}
        >
          Sales: £{payload[0].value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export const SalesDistributionChart = ({ siteId, month, months, year, years }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [textColor, setTextColor] = useState('#ffffff'); // Default to white

  // Get the computed foreground color from CSS variables
  useEffect(() => {
    const updateTextColor = () => {
      const root = document.documentElement;
      const computedColor = getComputedStyle(root).getPropertyValue('--foreground').trim();
      if (computedColor) {
        // Use white for better visibility on dark background
        setTextColor('#ffffff');
      }
    };
    
    updateTextColor();
    // Update on theme change
    const observer = new MutationObserver(updateTextColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!siteId) {
      setChartData([]);
      return;
    }

    // Use months/years arrays if provided, otherwise use single values
    const monthsToUse = (months && months.length > 0) ? months : (month ? [month] : []);
    const yearsToUse = (years && years.length > 0) ? years : (year ? [year] : []);

    if (monthsToUse.length === 0 || yearsToUse.length === 0) {
      setChartData([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Get aggregated sales distribution across all selected months/years
        const data = await dashboardAPI.getSalesDistribution(siteId, monthsToUse, yearsToUse);
        
        // Filter out Shop Sales and Valet Sales - only show Fuel Sales
        // Also filter out any items with zero or very small values
        const filteredData = data.filter(item => 
          item.name !== "Shop Sales" && 
          item.name !== "Valet Sales" &&
          item.value > 0.01 // Only include items with meaningful values
        );
        
        // Transform API data to chart format with colors
        const transformed = filteredData.map((item, index) => ({
          name: item.name,
          value: item.value,
          color: colors[index % colors.length]
        }));
        setChartData(transformed);
      } catch (error) {
        console.error('Error fetching sales distribution:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId, month, months, year, years]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  if (loading) {
    return (
      <div className="chart-card animate-slide-up" style={{ animationDelay: "600ms" }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-card animate-slide-up" style={{ animationDelay: "600ms" }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Sales Distribution
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card animate-slide-up" style={{ animationDelay: "600ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Sales Distribution
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
                  // Only show label if value is significant (> 2% and value > 0)
                  if (percent < 0.02 || value <= 0) return null;
                  
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#ffffff"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      fontSize={13}
                      fontWeight={600}
                      style={{
                        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                        color: '#ffffff',
                      }}
                    >
                      {`${(percent * 100).toFixed(1)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {/* Center label showing sales value */}
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize={14}
                fontWeight={600}
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                  color: '#ffffff',
                }}
              >
                Sales:
              </text>
              <text
                x="50%"
                y="52%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize={16}
                fontWeight={700}
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                  color: '#ffffff',
                }}
              >
                £{(total / 1000).toFixed(0)}k
              </text>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Table */}
        <div className="overflow-y-auto max-h-64">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold text-foreground">Category</th>
                <th className="text-right py-2 px-3 font-semibold text-foreground">Sales</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-border/60 hover:bg-muted/40 transition-colors"
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right text-foreground">
                    £{item.value.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-border font-semibold">
                <td className="py-2 px-3 text-foreground">Total</td>
                <td className="py-2 px-3 text-right text-foreground">
                  £{total.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

