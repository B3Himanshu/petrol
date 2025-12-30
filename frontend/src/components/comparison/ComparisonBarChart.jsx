import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart3 } from "lucide-react";

export const ComparisonBarChart = ({ site1Data, site2Data, site1Name, site2Name, loading }) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const chartRef = useRef(null);
  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    if (!chartRef.current || hasAnimated || !site1Data || !site2Data) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            // Start animation
            let startTime = null;
            const duration = 1500; // 1.5 seconds

            const animate = (timestamp) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              
              // Easing function for smooth animation (ease-out)
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
        threshold: 0.2, // Trigger when 20% of the component is visible
        rootMargin: '0px',
      }
    );

    observer.observe(chartRef.current);

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, [site1Data, site2Data, hasAnimated]);

  // Reset animation when data changes
  useEffect(() => {
    setHasAnimated(false);
    setAnimationProgress(0);
  }, [site1Data, site2Data]);

  if (loading || !site1Data || !site2Data) {
    return (
      <div className="chart-card h-[420px] animate-slide-up">
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading chart data...</div>
        </div>
      </div>
    );
  }

  // Prepare chart data - Separate by scale (with animation)
  // Large scale metrics (Sales, Profit, Volume)
  const largeScaleData = [
    {
      name: "Net Sales",
      [site1Name]: (site1Data.netSales || 0) * animationProgress,
      [site2Name]: (site2Data.netSales || 0) * animationProgress,
      type: "currency",
    },
    {
      name: "Profit",
      [site1Name]: (site1Data.profit || 0) * animationProgress,
      [site2Name]: (site2Data.profit || 0) * animationProgress,
      type: "currency",
    },
    {
      name: "Fuel Volume",
      [site1Name]: (site1Data.totalFuelVolume || 0) * animationProgress,
      [site2Name]: (site2Data.totalFuelVolume || 0) * animationProgress,
      type: "volume",
    },
  ];

  // Medium/Small scale metrics (Customers, Basket Size, Avg PPL)
  const smallScaleData = [
    {
      name: "Customers",
      [site1Name]: (site1Data.customerCount || 0) * animationProgress,
      [site2Name]: (site2Data.customerCount || 0) * animationProgress,
      type: "count",
    },
    {
      name: "Basket Size",
      [site1Name]: (site1Data.basketSize || 0) * animationProgress,
      [site2Name]: (site2Data.basketSize || 0) * animationProgress,
      type: "currency",
    },
    {
      name: "Avg PPL",
      [site1Name]: (site1Data.avgPPL || 0) * animationProgress,
      [site2Name]: (site2Data.avgPPL || 0) * animationProgress,
      type: "ppl",
    },
  ];

  // Custom tooltip
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
            {payload[0].payload.name}
          </p>
          {payload.map((entry, index) => {
            const metricType = entry.payload.type || "currency";
            let formattedValue = "";
            
            if (metricType === "ppl") {
              formattedValue = `${entry.value.toFixed(2)} p`;
            } else if (metricType === "volume") {
              if (entry.value >= 1000000) {
                formattedValue = `${(entry.value / 1000000).toFixed(1)}M L`;
              } else if (entry.value >= 1000) {
                formattedValue = `${(entry.value / 1000).toFixed(0)}K L`;
              } else {
                formattedValue = `${entry.value.toFixed(0)} L`;
              }
            } else if (metricType === "count") {
              formattedValue = entry.value.toLocaleString();
            } else {
              // currency
              if (entry.value >= 1000000) {
                formattedValue = `£${(entry.value / 1000000).toFixed(2)}M`;
              } else if (entry.value >= 1000) {
                formattedValue = `£${(entry.value / 1000).toFixed(1)}k`;
              } else {
                formattedValue = `£${entry.value.toFixed(2)}`;
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

  // Render chart component
  const renderChart = (data, title, subtitle) => {
    const maxValue = Math.max(
      ...data.flatMap(d => [d[site1Name] || 0, d[site2Name] || 0])
    );

    return (
      <div className="chart-card h-[420px] animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="85%">
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
              opacity={0.3}
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
              domain={[0, 'dataMax']}
              allowDataOverflow={false}
              tickFormatter={(value) => {
                if (maxValue >= 1000000) {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value.toFixed(0);
                } else if (maxValue >= 1000) {
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                  return value.toFixed(0);
                } else {
                  return value.toFixed(1);
                }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: "15px" }}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm font-medium text-foreground">{value}</span>
              )}
            />
            <Bar 
              dataKey={site1Name} 
              fill="#3b82f6" 
              radius={[6, 6, 0, 0]}
              name={site1Name}
              minPointSize={2}
            />
            <Bar 
              dataKey={site2Name} 
              fill="#10b981" 
              radius={[6, 6, 0, 0]}
              name={site2Name}
              minPointSize={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div ref={chartRef} className="space-y-6">
      {/* Large Scale Metrics Chart */}
      {renderChart(
        largeScaleData,
        "Financial & Volume Metrics",
        "Sales, Profit, and Fuel Volume comparison"
      )}

      {/* Small Scale Metrics Chart */}
      {renderChart(
        smallScaleData,
        "Operational Metrics",
        "Customers, Basket Size, and Average PPL comparison"
      )}
    </div>
  );
};
