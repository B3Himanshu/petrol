import { useState, useEffect, memo, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { dashboardAPI } from "@/services/api";
import { format, parseISO } from "date-fns";

const DateWiseDataChartComponent = ({ startDate, endDate }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const chartRef = useRef(null);

  // Fetch daily data
  useEffect(() => {
    if (!startDate || !endDate) {
      setChartData([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('📅 [DateWiseDataChart] Fetching data:', { startDate, endDate });
        
        const data = await dashboardAPI.getPetrolDailyData(startDate, endDate);
        
        console.log('📅 [DateWiseDataChart] Received data:', data);
        
        // Transform data for chart
        const transformed = (data || []).map(item => ({
          date: item.date,
          dateLabel: format(parseISO(item.date), 'dd/MM'),
          fuel_volume: item.fuel_volume || 0,
          fuel_sales: item.fuel_sales || 0,
          avg_ppl: item.avg_ppl || 0,
        }));
        
        setChartData(transformed);
      } catch (error) {
        console.error('❌ [DateWiseDataChart] Error fetching data:', error);
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
    fuel_volume: item.fuel_volume * animationProgress,
    fuel_sales: item.fuel_sales * animationProgress,
    avg_ppl: item.avg_ppl * animationProgress,
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
            
            if (entry.dataKey === 'fuel_volume') {
              if (value >= 1000000) {
                formattedValue = `${(value / 1000000).toFixed(1)}M L`;
              } else if (value >= 1000) {
                formattedValue = `${(value / 1000).toFixed(0)}K L`;
              } else {
                formattedValue = `${value.toFixed(0)} L`;
              }
            } else if (entry.dataKey === 'avg_ppl') {
              formattedValue = `${value.toFixed(2)} p`;
            } else {
              // fuel_sales (currency)
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

  // Find max values for Y-axis formatting
  const maxVolume = Math.max(...animatedData.map(d => d.fuel_volume || 0));
  const maxSales = Math.max(...animatedData.map(d => d.fuel_sales || 0));
  const maxPPL = Math.max(...animatedData.map(d => d.avg_ppl || 0));

  return (
    <div className="chart-card min-h-[450px] sm:min-h-[420px] h-auto sm:h-[420px] animate-slide-up overflow-hidden" ref={chartRef}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 lg:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">Date-wise Data</h3>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Daily trends for volume, sales, and PPL</p>
          </div>
        </div>
      </div>

      <div className="w-full h-[320px] sm:h-[calc(100%-120px)] lg:h-[85%] overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-[600px] sm:min-w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={280}>
            <LineChart 
              data={animatedData}
              margin={{ top: 10, right: 5, left: -5, bottom: 40 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false}
                opacity={0.3}
              />
              <XAxis 
                dataKey="dateLabel" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontWeight: 500 }}
                className="sm:text-xs lg:text-sm"
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8, fontWeight: 500 }}
                className="sm:text-xs lg:text-sm"
                width={30}
                tickFormatter={(value) => {
                  if (maxVolume >= 1000000 || maxSales >= 1000000) {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return `${value}`;
                  } else if (maxVolume >= 1000 || maxSales >= 1000) {
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                    return `${value}`;
                  } else {
                    return `${value.toFixed(0)}`;
                  }
                }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8, fontWeight: 500 }}
                className="sm:text-xs lg:text-sm"
                width={30}
                tickFormatter={(value) => `${value.toFixed(2)} p`}
              />
              <Tooltip 
                content={<CustomTooltip />}
              />
              <Legend 
                wrapperStyle={{ paddingTop: "10px", fontSize: "10px" }}
                iconType="circle"
                iconSize={10}
                formatter={(value) => (
                  <span className="text-xs sm:text-sm font-medium capitalize text-foreground">{value}</span>
                )}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="fuel_volume"
                stroke="#3b82f6"
                strokeWidth={3} 
                dot={{ r: 4, fill: "#3b82f6" }} 
                activeDot={{ r: 6, stroke: "hsl(var(--card))", strokeWidth: 2 }}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={800}
                name="Fuel Volume"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="fuel_sales"
                stroke="#ec4899"
                strokeWidth={3} 
                dot={{ r: 4, fill: "#ec4899" }} 
                activeDot={{ r: 6, stroke: "hsl(var(--card))", strokeWidth: 2 }}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={800}
                name="Fuel Sales"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avg_ppl"
                stroke="#8b5cf6"
                strokeWidth={3} 
                dot={{ r: 4, fill: "#8b5cf6" }} 
                activeDot={{ r: 6, stroke: "hsl(var(--card))", strokeWidth: 2 }}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={800}
                name="Average PPL"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const DateWiseDataChart = memo(DateWiseDataChartComponent);
