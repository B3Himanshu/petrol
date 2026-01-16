import { useState, useEffect, memo, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { dashboardAPI } from "@/services/api";

const MonthlyFuelPerformanceChartComponent = ({ startDate, endDate }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const chartRef = useRef(null);

  // Fetch monthly trends data
  useEffect(() => {
    if (!startDate || !endDate) {
      setChartData([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('📊 [MonthlyFuelPerformanceChart] Fetching data:', { startDate, endDate });
        
        const data = await dashboardAPI.getPetrolMonthlyTrends(startDate, endDate);
        
        console.log('📊 [MonthlyFuelPerformanceChart] Received data:', data);
        
        setChartData(data || []);
      } catch (error) {
        console.error('❌ [MonthlyFuelPerformanceChart] Error fetching data:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    if (!chartRef.current || hasAnimated || !chartData || chartData.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            let startTime = null;
            const duration = 1500;

            const animate = (timestamp) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              const easedProgress = 1 - Math.pow(1 - progress, 3);
              setAnimationProgress(easedProgress);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setAnimationProgress(1);
              }
            };

            requestAnimationFrame(animate);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px',
      }
    );

    observer.observe(chartRef.current);

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, [chartData, hasAnimated]);

  // Reset animation when data changes
  useEffect(() => {
    setHasAnimated(false);
    setAnimationProgress(0);
  }, [chartData]);

  // Apply animation to data
  const animatedData = chartData.map(item => ({
    ...item,
    sales: item.sales * animationProgress,
    volume: item.volume * animationProgress,
    profit: item.profit * animationProgress,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
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
            {label}
          </p>
          {payload.map((entry, index) => {
            let formattedValue = "";
            const value = entry.value || 0;
            
            if (entry.dataKey === 'volume') {
              if (value >= 1000000) {
                formattedValue = `${(value / 1000000).toFixed(1)}M L`;
              } else if (value >= 1000) {
                formattedValue = `${(value / 1000).toFixed(0)}K L`;
              } else {
                formattedValue = `${value.toFixed(0)} L`;
              }
            } else {
              // Sales or Profit (currency)
              if (value >= 1000000) {
                formattedValue = `£${(value / 1000000).toFixed(2)}M`;
              } else if (value >= 1000) {
                formattedValue = `£${(value / 1000).toFixed(1)}k`;
              } else {
                formattedValue = `£${value.toFixed(2)}`;
              }
            }
            
            return (
              <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                {entry.name}: {formattedValue}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="chart-card min-h-[450px] sm:min-h-[420px] h-auto sm:h-[420px] animate-slide-up">
        <div className="flex items-center justify-center min-h-[350px] sm:h-full">
          <div className="text-muted-foreground text-sm sm:text-base">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-card min-h-[450px] sm:min-h-[420px] h-auto sm:h-[420px] animate-slide-up">
        <div className="flex items-center justify-center min-h-[350px] sm:h-full">
          <div className="text-muted-foreground text-sm sm:text-base">No data available</div>
        </div>
      </div>
    );
  }

  // Find max value for Y-axis formatting
  const maxValue = Math.max(
    ...animatedData.flatMap(d => [d.sales || 0, d.volume || 0, d.profit || 0])
  );

  return (
    <div className="chart-card min-h-[450px] sm:min-h-[420px] h-auto sm:h-[420px] animate-slide-up overflow-hidden" ref={chartRef}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 lg:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">Monthly Fuel Performance</h3>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Sales, Volume, and Profit trends</p>
          </div>
        </div>
      </div>

      <div className="w-full h-[320px] sm:h-[calc(100%-120px)] lg:h-[85%] overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-[600px] sm:min-w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={280}>
            <BarChart 
              data={animatedData} 
              margin={{ top: 10, right: 5, left: -5, bottom: 40 }}
              barCategoryGap="10%"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false}
                opacity={0.3}
              />
              <XAxis 
                dataKey="month_name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontWeight: 500 }}
                className="sm:text-xs lg:text-sm"
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8, fontWeight: 500 }}
                className="sm:text-xs lg:text-sm"
                width={30}
                domain={[0, 'auto']}
                tickFormatter={(value) => {
                  if (maxValue >= 1000000) {
                    if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `£${(value / 1000).toFixed(0)}k`;
                    return `£${value}`;
                  } else if (maxValue >= 1000) {
                    if (value >= 1000) return `£${(value / 1000).toFixed(1)}k`;
                    return `£${value}`;
                  } else {
                    return `£${value.toFixed(0)}`;
                  }
                }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: "10px", fontSize: "10px" }}
                iconType="circle"
                iconSize={10}
                formatter={(value) => (
                  <span className="text-xs sm:text-sm font-medium capitalize text-foreground">{value}</span>
                )}
              />
              <Bar 
                dataKey="sales" 
                fill="#3b82f6" 
                radius={[0, 0, 0, 0]}
                name="Sales"
                isAnimationActive={true}
                animationDuration={800}
              />
              <Bar 
                dataKey="volume" 
                fill="#14b8a6" 
                radius={[0, 0, 0, 0]}
                name="Volume"
                isAnimationActive={true}
                animationDuration={800}
              />
              <Bar 
                dataKey="profit" 
                fill="#f97316" 
                radius={[6, 6, 0, 0]}
                name="Profit"
                isAnimationActive={true}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const MonthlyFuelPerformanceChart = memo(MonthlyFuelPerformanceChartComponent);
