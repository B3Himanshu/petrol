import { useState, useEffect, memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardAPI } from "@/services/api";

// Unified Custom Tooltip component for both bar and line charts
// This will be created inside the component to access filteredData
const createCustomTooltip = (chartData) => {
  return ({ active, payload, label }) => {
    // Debug logging
    if (active) {
      console.log('🔍 [CustomTooltip] Tooltip active:', { 
        active, 
        label, 
        payloadLength: payload?.length,
        payload: payload?.map(p => ({ 
          dataKey: p.dataKey, 
          value: p.value,
          payload: p.payload 
        }))
      });
    }

    // Show tooltip if active and we have either payload data OR a label to look up
    // Label can come from parameter or from payload
    if (active && label) {
    // Get colors from CSS variables to match the chart colors exactly
    const getColorFromCSSVar = (varName) => {
      if (typeof window !== 'undefined') {
        const root = document.documentElement;
        const value = getComputedStyle(root).getPropertyValue(varName).trim();
        if (value) {
          return `hsl(${value})`;
        }
      }
      // Fallback colors if CSS vars not available
      const fallbacks = {
        '--chart-blue': 'hsl(217, 91%, 60%)',
        '--chart-green': 'hsl(142, 71%, 45%)',
        '--chart-yellow': 'hsl(43, 96%, 56%)'
      };
      return fallbacks[varName] || '#8884d8';
    };

    const categoryColors = {
      fuel: getColorFromCSSVar('--chart-blue'),
      shop: getColorFromCSSVar('--chart-green'),
      valet: getColorFromCSSVar('--chart-yellow')
    };

    const categoryLabels = {
      fuel: "fuel",
      shop: "shop",
      valet: "valet"
    };

    // Get the data point - for stacked bars, all entries share the same payload object
    // For line charts, each entry has its own payload
    let dataPoint = {};
    let monthLabel = label; // Start with the label parameter
    
    // First, try to get data from payload if available
    if (payload && payload.length > 0) {
      // Try to get payload from first entry (works for both bar and line)
      dataPoint = payload[0]?.payload || {};
      
      // Extract month label from payload if label parameter is missing
      if (!monthLabel && dataPoint && dataPoint.month) {
        monthLabel = dataPoint.month;
      }
      
      // If payload doesn't have the data, try to get it from the entry itself
      if (!dataPoint || Object.keys(dataPoint).length === 0) {
        // For bar charts, sometimes the data is directly in the payload entry
        dataPoint = {
          month: monthLabel || label,
          fuel: payload.find(p => p.dataKey === 'fuel')?.value || 0,
          shop: payload.find(p => p.dataKey === 'shop')?.value || 0,
          valet: payload.find(p => p.dataKey === 'valet')?.value || 0,
        };
      }
    }
    
    // Fallback: look up from chartData using the label (month)
    // This is especially important when payload is empty (common with bar charts)
    if (!dataPoint || Object.keys(dataPoint).length === 0 || !dataPoint.month || !dataPoint.fuel) {
      // Try to find by monthLabel first, then by label
      const lookupLabel = monthLabel || label;
      if (lookupLabel) {
        const foundData = chartData.find(d => d.month === lookupLabel);
        if (foundData) {
          dataPoint = foundData;
          if (dataPoint.month) {
            monthLabel = dataPoint.month;
          }
          console.log('🔍 [CustomTooltip] Looked up from chartData:', { lookupLabel, dataPoint, chartDataLength: chartData.length });
        }
      }
    }
    
    // Ensure we have a month label - use from dataPoint if available
    if (!monthLabel && dataPoint && dataPoint.month) {
      monthLabel = dataPoint.month;
    }
    
    // Show only fuel sales
    const categoryKey = 'fuel';
    
    // Debug: log what we're about to render
    console.log('🔍 [CustomTooltip] Rendering tooltip:', { label, dataPoint, hasData: Object.keys(dataPoint).length > 0 });
    
    // Get fuel value - prioritize dataPoint (works even when payload is empty)
    let value = 0;
    // Method 1: Try to get from dataPoint first (works even when payload is empty)
    if (dataPoint && dataPoint[categoryKey] !== undefined && dataPoint[categoryKey] !== null) {
      value = parseFloat(dataPoint[categoryKey] || 0);
    } 
    // Method 2: Try to get from payload entry
    else if (payload && payload.length > 0) {
      const entry = payload.find(p => p.dataKey === categoryKey);
      if (entry && entry.value !== undefined && entry.value !== null) {
        value = parseFloat(entry.value || 0);
      }
    }
    
    const categoryName = categoryLabels[categoryKey] || categoryKey;
    const payloadEntry = payload && payload.length > 0 ? payload.find(p => p.dataKey === categoryKey) : null;
    const color = payloadEntry?.color || payloadEntry?.stroke || payloadEntry?.fill || categoryColors[categoryKey] || "#8884d8";
    
    // Ensure we have a valid month label to display
    const displayLabel = monthLabel || label || 'Unknown';
    
    const tooltipContent = (
      <div 
        className="rounded-lg p-3 shadow-xl min-w-[180px]"
        style={{
          backgroundColor: "hsl(222, 47%, 11%)", // Dark background
          border: "1px solid hsl(217, 33%, 17%)", // Border
          color: "#ffffff", // White text
          zIndex: 99999,
          pointerEvents: 'none',
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
          position: 'relative',
          opacity: 1,
          visibility: 'visible',
          display: 'block',
        }}
      >
        <p 
          className="font-semibold text-sm mb-2"
          style={{ color: "#ffffff" }}
        >
          {displayLabel}
        </p>
        <div className="flex items-center">
          <span 
            className="text-sm font-medium"
            style={{ color: color }}
          >
            {categoryName}: 
          </span>
          <span 
            className="text-sm ml-1"
            style={{ color: "#ffffff" }}
          >
            {value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    );
    
    return tooltipContent;
    }
    return null;
  };
};

const MonthlyPerformanceChartComponent = ({ siteId, year, years, month, months }) => {
  // JSX version: no TypeScript generic on useState
  const [viewType, setViewType] = useState("bar");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Use years array if provided, otherwise use single year
  const yearsToFetch = years && years.length > 0 ? years : (year ? [year] : []);
  // Use months array if provided, otherwise use single month
  const monthsToFilter = (months && months.length > 0) ? months : (month ? [month] : []);

  // Fetch monthly performance data
  useEffect(() => {
    if (!siteId || yearsToFetch.length === 0) {
      setChartData([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Pass all years to API - backend will aggregate data across all years
        const response = await dashboardAPI.getMonthlyPerformance(siteId, yearsToFetch);
        
        if (response && response.labels && response.datasets) {
          console.log('📊 [MonthlyPerformanceChart] Received API response:', {
            labelsCount: response.labels.length,
            labels: response.labels,
            datasets: response.datasets.map(d => ({ name: d.name, dataLength: d.data.length, sampleData: d.data.slice(0, 3) }))
          });
          
          // Transform API response to chart format
          // API returns: {labels: ['Jan', ...], datasets: [{name: 'Sales', data: [...]}, {name: 'Profit', data: [...]}, {name: 'Shop Sales', data: [...]}, {name: 'Valet Sales', data: [...]}]}
          // We need: [{month: 'Jan', fuel: ..., shop: ..., valet: ...}, ...]
          const salesDataset = response.datasets.find(d => d.name === 'Sales');
          const shopSalesDataset = response.datasets.find(d => d.name === 'Shop Sales');
          const valetSalesDataset = response.datasets.find(d => d.name === 'Valet Sales');
          
          // Ensure we always have exactly 12 months in order
          const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const transformed = monthOrder.map((monthLabel) => {
            const index = response.labels.indexOf(monthLabel);
            return {
              month: monthLabel,
              fuel: index >= 0 ? (salesDataset?.data[index] || 0) : 0,
              shop: index >= 0 ? (shopSalesDataset?.data[index] || 0) : 0,
              valet: index >= 0 ? (valetSalesDataset?.data[index] || 0) : 0,
            };
          });
          
          // Filter by selected months if provided
          let finalData = transformed;
          if (monthsToFilter && monthsToFilter.length > 0) {
            // Map month numbers (1-12) to month names (Jan-Dec)
            const monthNumberToName = {
              1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
              7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
            };
            const selectedMonthNames = monthsToFilter.map(m => monthNumberToName[m]).filter(Boolean);
            
            if (selectedMonthNames.length > 0) {
              finalData = transformed.filter(item => selectedMonthNames.includes(item.month));
            }
          }
          
          console.log('📊 [MonthlyPerformanceChart] Transformed chart data:', {
            totalMonths: finalData.length,
            selectedMonths: monthsToFilter,
            monthsWithFuelData: finalData.filter(d => d.fuel > 0).length,
            monthsWithShopData: finalData.filter(d => d.shop > 0).length,
            monthsWithValetData: finalData.filter(d => d.valet > 0).length,
            sampleData: finalData.slice(0, 3),
            allData: finalData.map(d => ({
              month: d.month,
              fuel: d.fuel,
              shop: d.shop,
              valet: d.valet
            }))
          });
          
          setChartData(finalData);
        } else {
          console.warn('📊 [MonthlyPerformanceChart] Invalid API response:', response);
          setChartData([]);
        }
      } catch (error) {
        console.error('Error fetching monthly performance:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId, yearsToFetch, monthsToFilter]);

  // Ensure we always have all 12 months in the correct order (or only selected months if filtered)
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // If months are filtered, create a subset of monthOrder with only selected months
  let monthsToDisplay = monthOrder;
  if (monthsToFilter && monthsToFilter.length > 0) {
    const monthNumberToName = {
      1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
      7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
    };
    const selectedMonthNames = monthsToFilter.map(m => monthNumberToName[m]).filter(Boolean);
    monthsToDisplay = monthOrder.filter(m => selectedMonthNames.includes(m));
  }
  
  // Filter data to show only fuel data
  let filteredData = chartData.map(item => ({
    month: item.month,
    fuel: item.fuel || 0,
  }));    
  
  // Ensure only selected months (or all months if not filtered) are present in the correct order
  const completeData = monthsToDisplay.map(monthLabel => {
    const existingData = filteredData.find(d => d.month === monthLabel);
    if (existingData) {
      return existingData;
    }
    // If month is missing, add it with zero values
    return {
      month: monthLabel,
      fuel: 0,
    };
  });
  
  filteredData = completeData;
  
  // Create tooltip component with memoization
  const tooltipComponent = useMemo(() => createCustomTooltip(filteredData), [filteredData]);
  
  // Log filtered data to debug
  console.log('📊 [MonthlyPerformanceChart] Filtered data for chart:', {
    totalMonths: filteredData.length,
    allMonths: filteredData.map(d => d.month),
    monthsWithData: filteredData.filter(d => d.fuel > 0).length,
    sampleData: filteredData.slice(0, 3),
    lastMonths: filteredData.slice(9, 12)
  });

  if (loading) {
    return (
      <div className="chart-card h-[420px] animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-card h-[420px] animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card h-[420px] animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Monthly Performance Trends</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Track your sales performance over time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden bg-muted/30 p-1">
            <button
              onClick={() => setViewType("bar")}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition-all rounded-md flex items-center gap-2",
                viewType === "bar"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Bar
            </button>
            <button
              onClick={() => setViewType("line")}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition-all rounded-md flex items-center gap-2",
                viewType === "line"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Line
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        {viewType === "bar" ? (
          <BarChart 
            data={filteredData} 
            margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
              opacity={0.3}
            />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
              type="category"
              allowDuplicatedCategory={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={70}
              tickFormatter={(value) => value}
              minTickGap={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
              domain={[0, 'auto']}
              tickFormatter={(value) => {
                if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `£${(value / 1000).toFixed(0)}k`;
                return `£${value}`;
              }}
            />
            <Tooltip 
              content={tooltipComponent}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              shared={true}
              isAnimationActive={false}
              labelFormatter={(value) => value || ''}
              wrapperStyle={{
                zIndex: 99999,
                visibility: 'visible',
                opacity: 1,
              }}
              contentStyle={{
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "15px" }}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm font-medium capitalize text-foreground">{value}</span>
              )}
            />
            <Bar 
              dataKey="fuel" 
              fill="url(#fuelGradient)" 
              radius={[6, 6, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
              name="Fuel"
            />
            <defs>
              <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        ) : (
          <LineChart 
            data={filteredData}
            margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
              opacity={0.3}
            />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
              type="category"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={70}
              tickFormatter={(value) => value}
              minTickGap={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `£${(value / 1000).toFixed(0)}k`;
                return `£${value}`;
              }}
            />
            <Tooltip 
              content={tooltipComponent}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "15px" }}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm font-medium capitalize text-foreground">{value}</span>
              )}
            />
            <Line 
              type="monotone" 
              dataKey="fuel" 
              stroke="hsl(217, 91%, 60%)" 
              strokeWidth={3} 
              dot={{ r: 5, fill: "hsl(217, 91%, 60%)", strokeWidth: 2, stroke: "hsl(var(--card))" }} 
              activeDot={{ r: 7, stroke: "hsl(var(--card))", strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive={true}
              animationDuration={800}
              name="Fuel"
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const MonthlyPerformanceChart = memo(MonthlyPerformanceChartComponent);
