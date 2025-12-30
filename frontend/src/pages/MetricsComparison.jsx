import { useState, useEffect, useCallback, useMemo } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { SplineLoader } from "@/components/dashboard/SplineLoader";
import { SiteCard } from "@/components/dashboard/SiteCard";
import { sitesAPI, dashboardAPI } from "@/services/api";
import { BarChart3, Filter, Table as TableIcon, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Plot from "react-plotly.js";

const MetricsComparison = () => {
  // Check if this is the initial app load
  const isInitialLoad = !sessionStorage.getItem('appInitialized');
  
  const [isLoading, setIsLoading] = useState(isInitialLoad);
  const [dashboardVisible, setDashboardVisible] = useState(!isInitialLoad);
  const loadingCompletedRef = { current: !isInitialLoad };
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Metrics options
  const METRICS_OPTIONS = [
    { value: 'sales', label: 'Sales', color: '#3b82f6' },
    { value: 'profit', label: 'Profit', color: '#10b981' },
    { value: 'saleVolume', label: 'Sale Volume', color: '#f59e0b' },
    { value: 'ppl', label: 'PPL', color: '#8b5cf6' },
  ];

  // Load saved filters from sessionStorage
  const loadSavedFilters = () => {
    try {
      const saved = sessionStorage.getItem('metricsComparisonFilters');
      if (saved) {
        const filters = JSON.parse(saved);
        return {
          months: filters.months || ["november"],
          years: filters.years || ["2025"],
          metrics: filters.metrics || ['sales', 'profit', 'saleVolume', 'ppl']
        };
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
    return {
      months: ["november"],
      years: ["2025"],
      metrics: ['sales', 'profit', 'saleVolume', 'ppl']
    };
  };

  const savedFilters = loadSavedFilters();

  // Pending filter states (what user selects before applying)
  const [pendingMonths, setPendingMonths] = useState(savedFilters.months);
  const [pendingYears, setPendingYears] = useState(savedFilters.years);
  const [pendingMetrics, setPendingMetrics] = useState(savedFilters.metrics);
  
  // Applied filter states (what's actually used for data fetching)
  const [appliedMonths, setAppliedMonths] = useState(savedFilters.months);
  const [appliedYears, setAppliedYears] = useState(savedFilters.years);
  const [appliedMetrics, setAppliedMetrics] = useState(savedFilters.metrics);
  
  // View state - table or charts (load from sessionStorage)
  const loadViewMode = () => {
    try {
      const saved = sessionStorage.getItem('metricsComparisonViewMode');
      return saved || 'charts';
    } catch (error) {
      return 'charts';
    }
  };
  const [viewMode, setViewMode] = useState(loadViewMode());
  
  // Save view mode to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('metricsComparisonViewMode', viewMode);
    } catch (error) {
      console.error('Error saving view mode:', error);
    }
  }, [viewMode]);
  
  // Data states
  const [sites, setSites] = useState([]);
  const [sitesData, setSitesData] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });
  
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640 && window.innerWidth < 1024;
    }
    return false;
  });
  const [totalSalesAllSites, setTotalSalesAllSites] = useState(null);
  
  // Update responsive state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Month name to number mapping
  const MONTH_NAME_TO_NUMBER = {
    january: 1, february: 2, march: 3, april: 4,
    may: 5, june: 6, july: 7, august: 8,
    september: 9, october: 10, november: 11, december: 12,
  };

  const MONTH_OPTIONS = [
    { value: "january", label: "January" },
    { value: "february", label: "February" },
    { value: "march", label: "March" },
    { value: "april", label: "April" },
    { value: "may", label: "May" },
    { value: "june", label: "June" },
    { value: "july", label: "July" },
    { value: "august", label: "August" },
    { value: "september", label: "September" },
    { value: "october", label: "October" },
    { value: "november", label: "November" },
    { value: "december", label: "December" },
  ];

  const YEAR_OPTIONS = [
    { value: "2022", label: "2022" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
  ];

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle loading complete
  useEffect(() => {
    if (loadingCompletedRef.current) return;
    
    sessionStorage.setItem('appInitialized', 'true');
    
    const showDashboard = () => {
      requestAnimationFrame(() => {
        loadingCompletedRef.current = true;
        setIsLoading(false);
        requestAnimationFrame(() => {
          setTimeout(() => {
            setDashboardVisible(true);
          }, 300);
        });
      });
    };

    if (document.readyState === 'complete') {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          showDashboard();
        }).catch(() => {
          setTimeout(showDashboard, 50);
        });
      } else {
        setTimeout(showDashboard, 50);
      }
    } else if (document.readyState === 'interactive') {
      window.addEventListener('load', () => {
        setTimeout(showDashboard, 50);
      }, { once: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(showDashboard, 100);
      }, { once: true });
    }
  }, []);

  // Fetch total sales across all sites (all months, all years)
  useEffect(() => {
    const fetchTotalSales = async () => {
      try {
        // Get all sales data (no month/year filter) - shows grand total
        console.log('📊 [MetricsComparison] Fetching total sales across all sites (all data):');
        
        const totalSalesData = await dashboardAPI.getTotalSales(null, null);
        setTotalSalesAllSites(totalSalesData?.totalSales || 0);
        
        console.log('✅ [MetricsComparison] Total sales across all sites received:', {
          totalSales: totalSalesData?.totalSales,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ [MetricsComparison] Error fetching total sales:', error);
        setTotalSalesAllSites(0);
      }
    };

    fetchTotalSales();
  }, []); // Only fetch once on mount

  // Fetch all sites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoadingSites(true);
        const sitesData = await sitesAPI.getAll();
        setSites(sitesData);
      } catch (error) {
        console.error('Error fetching sites:', error);
        setSites([]);
      } finally {
        setLoadingSites(false);
      }
    };
    fetchSites();
  }, []);

  // Handle Apply button click
  const handleApplyFilters = () => {
    // Validate that at least one metric is selected
    if (pendingMetrics.length === 0) {
      return; // Don't apply if no metrics selected
    }
    
    // Apply pending filters
    setAppliedMonths(pendingMonths);
    setAppliedYears(pendingYears);
    setAppliedMetrics(pendingMetrics);
    
    // Save to sessionStorage
    try {
      sessionStorage.setItem('metricsComparisonFilters', JSON.stringify({
        months: pendingMonths,
        years: pendingYears,
        metrics: pendingMetrics
      }));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  };

  // Fetch metrics data for all sites (only when applied filters change)
  useEffect(() => {
    if (sites.length === 0 || appliedMetrics.length === 0 || appliedMonths.length === 0 || appliedYears.length === 0) {
      setSitesData([]);
      return;
    }

    const fetchAllSitesData = async () => {
      try {
        setLoadingData(true);
        
        // Convert month names to numbers
        const monthNumbers = appliedMonths.map(month => 
          MONTH_NAME_TO_NUMBER[month.toLowerCase()] || 12
        );
        const yearNumbers = appliedYears.map(year => 
          parseInt(year, 10) || new Date().getFullYear()
        );

        // Fetch data for all sites in parallel
        const dataPromises = sites.map(async (site) => {
          try {
            const metrics = await dashboardAPI.getMetrics(site.id, monthNumbers, yearNumbers);
            return {
              siteId: site.id,
              siteName: site.name,
              city: site.cityDisplay,
              ...metrics
            };
          } catch (error) {
            console.error(`Error fetching data for site ${site.id}:`, error);
            return {
              siteId: site.id,
              siteName: site.name,
              city: site.cityDisplay,
              netSales: 0,
              profit: 0,
              totalFuelVolume: 0,
              avgPPL: 0
            };
          }
        });

        const allSitesData = await Promise.all(dataPromises);
        setSitesData(allSitesData);
      } catch (error) {
        console.error('Error fetching sites data:', error);
        setSitesData([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAllSitesData();
  }, [sites, appliedMonths, appliedYears, appliedMetrics]);

  // MultiSelect component for metrics
  const MetricsMultiSelect = () => {
    const [open, setOpen] = useState(false);

    const handleToggle = (value) => {
      if (pendingMetrics.includes(value)) {
        setPendingMetrics(pendingMetrics.filter(item => item !== value));
      } else {
        setPendingMetrics([...pendingMetrics, value]);
      }
    };

    const handleSelectAll = () => {
      if (pendingMetrics.length === METRICS_OPTIONS.length) {
        setPendingMetrics([]);
      } else {
        setPendingMetrics(METRICS_OPTIONS.map(opt => opt.value));
      }
    };

    const allSelected = pendingMetrics.length === METRICS_OPTIONS.length && METRICS_OPTIONS.length > 0;
    const displayText = pendingMetrics.length === 0 
      ? "Select metrics" 
      : pendingMetrics.length === 1
      ? METRICS_OPTIONS.find(opt => opt.value === pendingMetrics[0])?.label || "Select metrics"
      : allSelected
      ? "All metrics"
      : `${pendingMetrics.length} selected`;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between bg-background border-border",
              !pendingMetrics.length && "text-muted-foreground"
            )}
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <div className="border-b p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs justify-start"
              onClick={handleSelectAll}
            >
              {allSelected ? "Clear all" : "Select all"}
            </Button>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {METRICS_OPTIONS.map((option) => {
              const isSelected = pendingMetrics.includes(option.value);
              return (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                  onClick={() => handleToggle(option.value)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(option.value)}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: option.color }}
                    />
                    <label className="text-sm font-medium leading-none cursor-pointer flex-1">
                      {option.label}
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // MultiSelect for months/years
  const MultiSelect = ({ options, selected, onChange, placeholder, label }) => {
    const [open, setOpen] = useState(false);

    const handleToggle = (value) => {
      if (selected.includes(value)) {
        onChange(selected.filter(item => item !== value));
      } else {
        onChange([...selected, value]);
      }
    };

    const handleSelectAll = () => {
      if (selected.length === options.length) {
        onChange([]);
      } else {
        onChange(options.map(opt => opt.value));
      }
    };

    const allSelected = selected.length === options.length && options.length > 0;
    const displayText = selected.length === 0 
      ? placeholder 
      : selected.length === 1
      ? options.find(opt => opt.value === selected[0])?.label || placeholder
      : allSelected
      ? `All ${label.toLowerCase()}s`
      : `${selected.length} selected`;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between bg-background border-border",
              !selected.length && "text-muted-foreground"
            )}
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <div className="border-b p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs justify-start"
              onClick={handleSelectAll}
            >
              {allSelected ? "Clear all" : "Select all"}
            </Button>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                  onClick={() => handleToggle(option.value)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(option.value)}
                  />
                  <label className="text-sm font-medium leading-none cursor-pointer flex-1">
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Format helpers
  const formatCurrency = (amount) => {
    if (!amount) return "£0";
    if (amount >= 1000000) return `£${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `£${(amount / 1000).toFixed(1)}k`;
    return `£${amount.toFixed(0)}`;
  };

  const formatVolume = (liters) => {
    if (!liters) return "0 L";
    if (liters >= 1000000) return `${(liters / 1000000).toFixed(1)}M L`;
    if (liters >= 1000) return `${(liters / 1000).toFixed(0)}K L`;
    return `${liters.toFixed(0)} L`;
  };

  // Sort sites data based on applied metrics
  const getSortedSitesData = () => {
    if (appliedMetrics.length === 0) return sitesData;
    
    return [...sitesData].sort((a, b) => {
      // Sort by first applied metric (descending)
      const firstMetric = appliedMetrics[0];
      let aValue = 0;
      let bValue = 0;
      
      switch (firstMetric) {
        case 'sales':
          aValue = a.netSales || 0;
          bValue = b.netSales || 0;
          break;
        case 'profit':
          aValue = a.profit || 0;
          bValue = b.profit || 0;
          break;
        case 'saleVolume':
          aValue = a.totalFuelVolume || 0;
          bValue = b.totalFuelVolume || 0;
          break;
        case 'ppl':
          aValue = a.avgPPL || 0;
          bValue = b.avgPPL || 0;
          break;
      }
      
      return bValue - aValue;
    });
  };

  // Prepare data for Plotly bar chart
  const barChartData = useMemo(() => {
    if (sitesData.length === 0 || appliedMetrics.length === 0) return null;

    const sortedData = getSortedSitesData();
    const siteNames = sortedData.map(site => site.siteName);
    
    // Helper function to format currency
    const formatCurrencyValue = (amount) => {
      if (!amount) return "£0";
      if (amount >= 1000000) return `£${(amount / 1000000).toFixed(2)}M`;
      if (amount >= 1000) return `£${(amount / 1000).toFixed(1)}k`;
      return `£${amount.toFixed(0)}`;
    };

    // Helper function to format volume
    const formatVolumeValue = (liters) => {
      if (!liters) return "0 L";
      if (liters >= 1000000) return `${(liters / 1000000).toFixed(1)}M L`;
      if (liters >= 1000) return `${(liters / 1000).toFixed(0)}K L`;
      return `${liters.toFixed(0)} L`;
    };

    const traces = appliedMetrics.map(metric => {
      const metricOption = METRICS_OPTIONS.find(opt => opt.value === metric);
      const values = sortedData.map(site => {
        switch (metric) {
          case 'sales':
            return site.netSales || 0;
          case 'profit':
            return site.profit || 0;
          case 'saleVolume':
            return site.totalFuelVolume || 0;
          case 'ppl':
            return site.avgPPL || 0;
          default:
            return 0;
        }
      });

      // Create custom hover data that includes all metrics for each site
      // We'll build the hover text as a pre-formatted string for each site
      const customdata = sortedData.map((site) => {
        // Build the hover text with all metrics for this site, with white color styling
        let hoverText = `<span style="color: white;"><b>${site.siteName}</b><br>`;
        
        appliedMetrics.forEach(m => {
          const mOption = METRICS_OPTIONS.find(opt => opt.value === m);
          let value = 0;
          let formattedValue = '';
          
          switch (m) {
            case 'sales':
              value = site.netSales || 0;
              formattedValue = formatCurrencyValue(value);
              break;
            case 'profit':
              value = site.profit || 0;
              formattedValue = formatCurrencyValue(value);
              break;
            case 'saleVolume':
              value = site.totalFuelVolume || 0;
              formattedValue = formatVolumeValue(value);
              break;
            case 'ppl':
              value = site.avgPPL || 0;
              formattedValue = `${value.toFixed(2)} p`;
              break;
          }
          
          hoverText += `${mOption?.label || m}: ${formattedValue}<br>`;
        });
        
        hoverText += '</span><extra></extra>';
        
        return hoverText;
      });

      // Build hover template - use customdata directly as the hover text
      const hoverTemplate = '%{customdata}';

      return {
        x: siteNames,
        y: values,
        name: metricOption?.label || metric,
        type: 'bar',
        marker: {
          color: metricOption?.color || '#8884d8',
        },
        customdata: customdata,
        hovertemplate: hoverTemplate,
      };
    });

    return {
      data: traces,
      layout: {
        title: {
          text: 'Metrics Comparison Across All Sites',
          font: { size: 18, color: 'hsl(var(--foreground))' },
        },
        xaxis: {
          title: 'Sites',
          tickangle: -45,
          tickfont: { size: 10, color: 'hsl(var(--muted-foreground))' },
        },
        yaxis: {
          title: 'Value',
          tickfont: { color: 'hsl(var(--muted-foreground))' },
        },
        barmode: appliedMetrics.length > 1 ? 'group' : 'bar',
        hovermode: 'closest',
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: 'hsl(var(--foreground))' },
        hoverlabel: {
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          bordercolor: 'rgba(255, 255, 255, 0.2)',
          font: {
            color: '#ffffff',
            size: 12,
          },
        },
        legend: {
          orientation: isMobile ? 'v' : 'h',
          yanchor: isMobile ? 'top' : 'bottom',
          y: isMobile ? -0.2 : 1.02,
          xanchor: isMobile ? 'left' : 'right',
          x: isMobile ? 0 : 1,
          font: { 
            color: 'hsl(var(--foreground))',
            size: isMobile ? 9 : 12
          },
        },
        margin: { 
          l: isMobile ? 40 : 60, 
          r: isMobile ? 10 : 20, 
          t: isMobile ? 60 : 80, 
          b: isMobile ? 120 : 100 
        },
      },
      config: {
        displayModeBar: true,
        responsive: true,
        displaylogo: false,
      },
    };
  }, [sitesData, appliedMetrics]);

  // Prepare data for Plotly pie charts (one per applied metric)
  const pieChartsData = useMemo(() => {
    if (sitesData.length === 0 || appliedMetrics.length === 0) return [];

    const sortedData = getSortedSitesData();
    
    return appliedMetrics.map(metric => {
      const metricOption = METRICS_OPTIONS.find(opt => opt.value === metric);
      
      // Get all data - show ALL sites, no grouping
      const labels = sortedData.map(site => site.siteName);
      const values = sortedData.map(site => {
        switch (metric) {
          case 'sales':
            return site.netSales || 0;
          case 'profit':
            return site.profit || 0;
          case 'saleVolume':
            return site.totalFuelVolume || 0;
          case 'ppl':
            return site.avgPPL || 0;
          default:
            return 0;
        }
      });

      // Generate color palette based on metric color
      const generateColorPalette = (baseColor, count) => {
        // Convert hex to RGB
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Generate variations with better contrast for all sites
        const colors = [];
        for (let i = 0; i < count; i++) {
          // Create distinct color variations using HSL-like transformations
          // Vary brightness and saturation to create more distinct colors
          const brightnessVariation = 0.4 + (i % 8) * 0.1;
          const saturationVariation = 0.7 + (Math.floor(i / 8) % 3) * 0.1;
          
          const newR = Math.min(255, Math.max(0, Math.floor(r * brightnessVariation * saturationVariation)));
          const newG = Math.min(255, Math.max(0, Math.floor(g * brightnessVariation * saturationVariation)));
          const newB = Math.min(255, Math.max(0, Math.floor(b * brightnessVariation * saturationVariation)));
          
          colors.push(`rgb(${newR}, ${newG}, ${newB})`);
        }
        return colors;
      };

      return {
        data: [{
          labels: labels,
          values: values,
          type: 'pie',
          hole: 0.4,
          marker: {
            colors: generateColorPalette(metricOption?.color || '#8884d8', labels.length),
            line: {
              color: 'hsl(var(--background))',
              width: 2,
            },
          },
          // Show percentage inside slices, site names in legend only
          textinfo: 'percent',
          textposition: 'inside',
          textfont: {
            size: 13,
            color: '#ffffff', // White text for better visibility
            family: 'Arial, sans-serif',
          },
          // Don't show labels outside to prevent overlap
          insidetextorientation: 'radial',
          // Only show text on slices larger than 3% to avoid clutter
          automargin: true,
          hovertemplate: '<b>%{label}</b><br>' +
            `${metricOption?.label || metric}: %{value:,.0f}<br>` +
            'Percentage: %{percent}<br>' +
            '<extra></extra>',
        }],
        layout: {
          title: {
            text: `${metricOption?.label || metric} Distribution`,
            font: { size: 16, color: 'hsl(var(--foreground))' },
          },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: 'hsl(var(--foreground))' },
          showlegend: true,
          legend: {
            font: { 
              color: 'hsl(var(--foreground))',
              size: isMobile ? 8 : 10,
            },
            orientation: isMobile ? 'h' : 'v',
            x: isMobile ? 0.5 : 1.02,
            y: isMobile ? -0.15 : 0.5,
            xanchor: isMobile ? 'center' : 'left',
            yanchor: isMobile ? 'top' : 'middle',
            traceorder: 'normal',
            itemwidth: isMobile ? 20 : 25,
            bgcolor: 'transparent',
            bordercolor: 'hsl(var(--border))',
            borderwidth: 1,
            // Make legend scrollable if there are many items
            yref: 'paper',
          },
          margin: { 
            l: 0, 
            r: isMobile ? 0 : isTablet ? 150 : 250, 
            t: isMobile ? 40 : 60, 
            b: isMobile ? 5 : 20 
          },
          annotations: [{
            text: `Showing all ${labels.length} sites`,
            showarrow: false,
            x: 0.5,
            y: -0.12,
            xref: 'paper',
            yref: 'paper',
            font: { 
              size: 10, 
              color: 'hsl(var(--muted-foreground))' 
            },
          }],
        },
        config: {
          displayModeBar: true,
          responsive: true,
          displaylogo: false,
        },
      };
    });
  }, [sitesData, appliedMetrics]);

  // Apply text shadow styling to Plotly pie chart text for better visibility
  // This must be after pieChartsData is defined
  useEffect(() => {
    const applyTextStyling = () => {
      const pieTextElements = document.querySelectorAll('.js-plotly-plot .pie text');
      pieTextElements.forEach((textEl) => {
        textEl.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.9), -2px -2px 4px rgba(0, 0, 0, 0.9), 2px -2px 4px rgba(0, 0, 0, 0.9), -2px 2px 4px rgba(0, 0, 0, 0.9)';
        textEl.style.fontWeight = 'bold';
        textEl.style.fontSize = '13px';
      });
    };

    // Apply immediately
    applyTextStyling();

    // Apply after a short delay to catch dynamically rendered elements
    const timeoutId = setTimeout(applyTextStyling, 100);
    
    // Also apply on any DOM mutations (when charts update)
    const observer = new MutationObserver(applyTextStyling);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [pieChartsData, loadingData, appliedMetrics]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Spline Loading Screen */}
      {isLoading && (
        <SplineLoader 
          onLoadingComplete={() => setIsLoading(false)}
          isLoading={isLoading}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`transition-all duration-1200 ease-out ${
          dashboardVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-0 pointer-events-none'
        }`}
      >
        <main 
          style={{ willChange: 'margin-left' }}
          className={`transition-[margin-left] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} ml-0`}
        >
          <Header 
            sidebarOpen={sidebarOpen} 
            onToggleSidebar={toggleSidebar} 
            totalSales={totalSalesAllSites}
          />
          
          <div className="p-4 lg:p-6">
            {/* Page Title */}
            <div className="mb-4 lg:mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">Metrics Comparison</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Compare all sites by selected metrics</p>
              </div>
            </div>

            {/* Filter Section */}
            <div className="chart-card mb-4 lg:mb-6 animate-slide-up">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <span className="text-sm lg:text-base font-semibold text-foreground">
                    Filters
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mb-4">
                {/* Metrics Selector */}
                <div>
                  <label className="text-xs font-medium text-primary mb-2 block">
                    Select Metrics
                  </label>
                  <MetricsMultiSelect />
                </div>

                {/* Year Selection */}
                <div>
                  <label className="text-xs font-medium text-primary mb-2 block">
                    Year
                  </label>
                  <MultiSelect
                    options={YEAR_OPTIONS}
                    selected={pendingYears}
                    onChange={setPendingYears}
                    placeholder="Select year(s)"
                    label="year"
                  />
                </div>

                {/* Month Selection */}
                <div>
                  <label className="text-xs font-medium text-primary mb-2 block">
                    Month
                  </label>
                  <MultiSelect
                    options={MONTH_OPTIONS}
                    selected={pendingMonths}
                    onChange={setPendingMonths}
                    placeholder="Select month(s)"
                    label="month"
                  />
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleApplyFilters}
                  disabled={pendingMetrics.length === 0}
                  className="flex items-center gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Apply Filters</span>
                </Button>
              </div>
            </div>

            {/* All 29 Sites - Show after filters are applied, only in charts view */}
            {appliedMetrics.length > 0 && sitesData.length > 0 && viewMode === 'charts' && (
              <div className="mb-6 lg:mb-8">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                      All 29 Sites
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Comparing {sitesData.length} sites by {appliedMetrics.map(m => METRICS_OPTIONS.find(o => o.value === m)?.label).join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'charts' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('charts')}
                      className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Charts</span>
                      <span className="xs:hidden">Chart</span>
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <TableIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      Table
                    </Button>
                  </div>
                </div>
                
                {loadingData ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="chart-card h-80 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {getSortedSitesData().map((siteData, index) => {
                      // Find the corresponding site info from sites array
                      const siteInfo = sites.find(s => s.id === siteData.siteId);
                      return (
                        <SiteCard
                          key={siteData.siteId}
                          site={{
                            siteId: siteData.siteId,
                            siteName: siteData.siteName,
                            name: siteData.siteName,
                            id: siteData.siteId,
                            city: siteData.city
                          }}
                          metrics={siteData}
                          index={index}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Charts View */}
            {appliedMetrics.length > 0 && viewMode === 'charts' && (
              <>
                {/* Bar Chart */}
                {barChartData && (
                  <div className="chart-card mb-4 lg:mb-6 animate-slide-up">
                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <span>Bar Chart Comparison</span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Visual comparison of selected metrics across all sites
                      </p>
                    </div>
                    {loadingData ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="text-muted-foreground">Loading chart data...</div>
                      </div>
                    ) : (
                      <div className="w-full" style={{ height: isMobile ? '350px' : isTablet ? '400px' : '500px' }}>
                        <Plot
                          data={barChartData.data}
                          layout={barChartData.layout}
                          config={barChartData.config}
                          style={{ width: '100%', height: '100%' }}
                          useResizeHandler={true}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Pie Charts */}
                {pieChartsData.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {pieChartsData.map((pieData, index) => {
                      const metric = appliedMetrics[index];
                      const metricOption = METRICS_OPTIONS.find(opt => opt.value === metric);
                      return (
                        <div key={metric} className="chart-card animate-slide-up">
                          <div className="mb-3 sm:mb-4">
                            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 flex items-center gap-2">
                              <PieChart className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: metricOption?.color }} />
                              <span className="truncate">{metricOption?.label || metric} Distribution</span>
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Percentage distribution across all sites
                            </p>
                          </div>
                          {loadingData ? (
                            <div className="flex items-center justify-center h-64">
                              <div className="text-muted-foreground">Loading chart...</div>
                            </div>
                          ) : (
                            <div className="w-full" style={{ height: isMobile ? '450px' : isTablet ? '400px' : '400px' }}>
                              <Plot
                                data={pieData.data}
                                layout={pieData.layout}
                                config={pieData.config}
                                style={{ width: '100%', height: '100%' }}
                                useResizeHandler={true}
                                onInitialized={(figure, graphDiv) => {
                                  // Add text shadow to pie chart text for better visibility
                                  if (graphDiv) {
                                    const textElements = graphDiv.querySelectorAll('.pie text');
                                    textElements.forEach((textEl) => {
                                      textEl.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8)';
                                      textEl.style.fontWeight = 'bold';
                                    });
                                  }
                                }}
                                onUpdate={(figure, graphDiv) => {
                                  // Reapply text shadow on updates
                                  if (graphDiv) {
                                    const textElements = graphDiv.querySelectorAll('.pie text');
                                    textElements.forEach((textEl) => {
                                      textEl.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8)';
                                      textEl.style.fontWeight = 'bold';
                                    });
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Table View */}
            {appliedMetrics.length > 0 && viewMode === 'table' && (
              <>
                {/* Header with view toggle */}
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                      All 29 Sites
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Comparing {sitesData.length} sites by {appliedMetrics.map(m => METRICS_OPTIONS.find(o => o.value === m)?.label).join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'charts' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('charts')}
                      className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Charts</span>
                      <span className="xs:hidden">Chart</span>
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <TableIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      Table
                    </Button>
                  </div>
                </div>

                <div className="chart-card animate-slide-up">

                {loadingData ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading comparison data...</div>
                  </div>
                ) : sitesData.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-muted-foreground">No data available. Please select metrics and filters.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[120px] sm:min-w-[150px] text-xs sm:text-sm">Site Name</TableHead>
                            <TableHead className="min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm">City</TableHead>
                          {appliedMetrics.includes('sales') && (
                            <TableHead className="text-right min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                                <span>Sales</span>
                              </div>
                            </TableHead>
                          )}
                          {appliedMetrics.includes('profit') && (
                            <TableHead className="text-right min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                                <span>Profit</span>
                              </div>
                            </TableHead>
                          )}
                          {appliedMetrics.includes('saleVolume') && (
                            <TableHead className="text-right min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                                <span className="hidden sm:inline">Sale Volume</span>
                                <span className="sm:hidden">Volume</span>
                              </div>
                            </TableHead>
                          )}
                          {appliedMetrics.includes('ppl') && (
                            <TableHead className="text-right min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
                                <span>PPL</span>
                              </div>
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getSortedSitesData().map((site, index) => (
                          <TableRow key={site.siteId} className={index % 2 === 0 ? 'bg-card/30' : ''}>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              {site.siteName}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs sm:text-sm">{site.city}</TableCell>
                            {appliedMetrics.includes('sales') && (
                              <TableCell className="text-right font-semibold text-xs sm:text-sm" style={{ color: '#3b82f6' }}>
                                {formatCurrency(site.netSales || 0)}
                              </TableCell>
                            )}
                            {appliedMetrics.includes('profit') && (
                              <TableCell className="text-right font-semibold text-xs sm:text-sm" style={{ color: '#10b981' }}>
                                {formatCurrency(site.profit || 0)}
                              </TableCell>
                            )}
                            {appliedMetrics.includes('saleVolume') && (
                              <TableCell className="text-right font-semibold text-xs sm:text-sm" style={{ color: '#f59e0b' }}>
                                {formatVolume(site.totalFuelVolume || 0)}
                              </TableCell>
                            )}
                            {appliedMetrics.includes('ppl') && (
                              <TableCell className="text-right font-semibold text-xs sm:text-sm" style={{ color: '#8b5cf6' }}>
                                {site.avgPPL?.toFixed(2) || '0.00'} p
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  </div>
                )}
                </div>
              </>
            )}

            {/* Empty State */}
            {appliedMetrics.length === 0 && (
              <div className="chart-card h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Select Metrics to Compare
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Choose one or more metrics from the filter above to view comparison across all sites
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MetricsComparison;

