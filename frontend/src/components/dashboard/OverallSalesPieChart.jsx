import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Label } from "recharts";
import { cn } from "@/lib/utils";
import { dashboardAPI } from "@/services/api";

// Custom Tooltip component with theme-aware colors
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="bg-card border border-border rounded-lg p-3 shadow-lg"
        style={{
          backgroundColor: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          color: "hsl(var(--foreground))",
        }}
      >
        <p className="text-foreground font-medium mb-1">
          {payload[0].name}
        </p>
        <p className="text-foreground font-semibold">
          Sales: £{payload[0].value.toLocaleString()}
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
  const [textColor, setTextColor] = useState('#000000'); // Default to black

  // Get the computed foreground color from CSS variables
  useEffect(() => {
    const updateTextColor = () => {
      const root = document.documentElement;
      const computedColor = getComputedStyle(root).getPropertyValue('--foreground').trim();
      if (computedColor) {
        // Convert HSL values to hex or use directly
        setTextColor(`hsl(${computedColor})`);
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

  return (
    <div className="chart-card h-[420px] animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Overall Sales
        </h3>
        <div className="text-xs text-muted-foreground">
          Total: £{total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      
      <div className="h-[320px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
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
                    fill={textColor}
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    fontSize={13}
                    fontWeight={600}
                    style={{
                      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                    }}
                  >
                    {`${(percent * 100).toFixed(1)}%`}
                  </text>
                );
              }}
              innerRadius={60}
              outerRadius={110}
              paddingAngle={2}
              fill="#8884d8"
              dataKey="value"
              stroke="hsl(var(--card))"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                    transition: 'opacity 0.2s',
                  }}
                />
              ))}
            </Pie>
            {/* Center label showing total */}
            <text
              x="50%"
              y="48%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={textColor}
              fontSize={16}
              fontWeight={700}
              style={{
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
              }}
            >
              Total Sales
            </text>
            <text
              x="50%"
              y="52%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={textColor}
              fontSize={14}
              fontWeight={500}
              opacity={0.8}
            >
              £{(total / 1000).toFixed(0)}k
            </text>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={60}
              wrapperStyle={{ paddingTop: "10px" }}
              iconType="circle"
              formatter={(value, entry) => {
                const item = chartData.find(d => d.name === value);
                const percentage = item ? ((item.value / total) * 100).toFixed(1) : '0.0';
                return (
                  <span className="text-sm text-muted-foreground">
                    <span style={{ color: entry.color, fontWeight: 600 }}>{value}</span>
                    <span className="ml-2 opacity-70">({percentage}%)</span>
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Breakdown: Fuel sales (Non-bunkered & Bunkered)
        </p>
      </div>
    </div>
  );
};

