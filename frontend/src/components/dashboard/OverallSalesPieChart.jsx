import { useState, useEffect, useMemo, useRef } from "react";
import Plot from "react-plotly.js";
import { TrendingUp } from "lucide-react";
import { dashboardAPI } from "@/services/api";


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
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const chartRef = useRef(null);

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

  // Calculate total for center label (safe even if chartData is empty)
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  // Animated total for center display
  const animatedTotal = total * animationProgress;

  // Format total for display
  const formatTotal = (value) => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `£${(value / 1000).toFixed(0)}k`;
    }
    return `£${value.toFixed(0)}`;
  };

  // Format currency for display
  const formatCurrency = (value) => {
    return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    if (!chartRef.current || hasAnimated || !chartData || chartData.length === 0) return;

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
        threshold: 0.2, // Trigger when 20% of the chart is visible
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

  // Apply text shadow styling to Plotly pie chart text
  useEffect(() => {
    if (!chartData || chartData.length === 0) return;

    const applyTextStyling = () => {
      const pieTextElements = document.querySelectorAll('.js-plotly-plot .pie text');
      pieTextElements.forEach((textEl) => {
        textEl.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.9), -2px -2px 4px rgba(0, 0, 0, 0.9), 2px -2px 4px rgba(0, 0, 0, 0.9), -2px 2px 4px rgba(0, 0, 0, 0.9)';
        textEl.style.fontWeight = 'bold';
      });
    };

    applyTextStyling();
    const timeoutId = setTimeout(applyTextStyling, 100);
    const observer = new MutationObserver(applyTextStyling);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [chartData, loading, animationProgress]);

  // Prepare Plotly pie chart data (must be before early returns)
  const plotlyData = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    const labels = chartData.map(item => item.name);
    // Animate values from 0 to actual values based on animationProgress
    const values = chartData.map(item => item.value * animationProgress);
    const colors = chartData.map(item => item.color);

    return {
      data: [{
        labels: labels,
        values: values,
        type: 'pie',
        hole: 0.5, // Slightly larger hole for better center text visibility
        marker: {
          colors: colors,
          line: {
            color: 'hsl(var(--background))',
            width: 2,
          },
        },
        textinfo: 'percent',
        textposition: 'inside',
        textfont: {
          size: 13,
          color: '#ffffff',
          family: 'Arial, sans-serif',
        },
        insidetextorientation: 'radial',
        hovertemplate: '<span style="color: white;"><b>%{label}</b><br>' +
          'Sales: £%{value:,.2f}<br>' +
          'Percentage: %{percent}<br>' +
          '</span><extra></extra>',
        rotation: 90,
        sort: false,
      }],
      layout: {
        title: {
          text: '',
        },
        annotations: [
          {
            text: 'Total Sales',
            x: 0.5,
            y: 0.55,
            xref: 'paper',
            yref: 'paper',
            showarrow: false,
            font: {
              size: 13,
              color: 'hsl(var(--muted-foreground))',
              family: 'Arial, sans-serif',
            },
          },
          {
            text: formatTotal(animatedTotal),
            x: 0.5,
            y: 0.45,
            xref: 'paper',
            yref: 'paper',
            showarrow: false,
            font: {
              size: 24,
              color: 'hsl(var(--foreground))',
              family: 'Arial, sans-serif',
            },
          },
        ],
        showlegend: true,
        legend: {
          orientation: 'h',
          yanchor: 'bottom',
          y: -0.15,
          xanchor: 'center',
          x: 0.5,
          font: {
            color: 'hsl(var(--foreground))',
            size: 12,
            family: 'Arial, sans-serif',
          },
          itemclick: false,
          itemdoubleclick: false,
          traceorder: 'normal',
          itemsizing: 'constant',
          itemwidth: 30,
          bgcolor: 'transparent',
          bordercolor: 'hsl(var(--border))',
          borderwidth: 0,
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: {
          color: 'hsl(var(--foreground))',
          family: 'Arial, sans-serif',
        },
        margin: { l: 20, r: 20, t: 20, b: 80 },
        hoverlabel: {
          bgcolor: 'rgba(0, 0, 0, 0.85)',
          bordercolor: 'rgba(255, 255, 255, 0.3)',
          font: {
            color: '#ffffff',
            size: 13,
            family: 'Arial, sans-serif',
          },
          namelength: -1,
        },
        autosize: true,
      },
      config: {
        displayModeBar: true,
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
      },
    };
  }, [chartData, total, animationProgress]);

  // Early returns after all hooks
  if (loading) {
    return (
      <div className="chart-card h-[450px] animate-slide-up" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-card h-[450px] animate-slide-up" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Overall Sales</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Sales distribution breakdown</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-[320px]">
          <div className="text-muted-foreground">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card h-[450px] animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Overall Sales</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Sales distribution breakdown</p>
          </div>
        </div>
        <div className="text-sm font-semibold text-foreground bg-card/50 px-3 py-1.5 rounded-lg border border-border/50">
          Total: {formatCurrency(total)}
        </div>
      </div>
      
      <div className="h-[320px] relative flex items-center justify-center" ref={chartRef}>
        {plotlyData ? (
          <div className="w-full h-full">
            <Plot
              data={plotlyData.data}
              layout={plotlyData.layout}
              config={plotlyData.config}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
              onInitialized={(figure, graphDiv) => {
                // Add text shadow to pie chart text for better visibility
                if (graphDiv) {
                  const pieTextElements = graphDiv.querySelectorAll('.pie text');
                  pieTextElements.forEach((textEl) => {
                    textEl.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.9), -2px -2px 4px rgba(0, 0, 0, 0.9), 2px -2px 4px rgba(0, 0, 0, 0.9), -2px 2px 4px rgba(0, 0, 0, 0.9)';
                    textEl.style.fontWeight = 'bold';
                    textEl.style.fontSize = '13px';
                  });
                }
              }}
              onUpdate={(figure, graphDiv) => {
                // Reapply text shadow on updates
                if (graphDiv) {
                  const pieTextElements = graphDiv.querySelectorAll('.pie text');
                  pieTextElements.forEach((textEl) => {
                    textEl.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.9), -2px -2px 4px rgba(0, 0, 0, 0.9), 2px -2px 4px rgba(0, 0, 0, 0.9), -2px 2px 4px rgba(0, 0, 0, 0.9)';
                    textEl.style.fontWeight = 'bold';
                    textEl.style.fontSize = '13px';
                  });
                }
              }}
            />
          </div>
        ) : (
          <div className="text-muted-foreground">No data available</div>
        )}
      </div>
    </div>
  );
};

