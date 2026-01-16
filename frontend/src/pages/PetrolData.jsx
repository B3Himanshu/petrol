import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Fuel, CalendarDays } from "lucide-react";
import { dashboardAPI } from "@/services/api";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { PetrolKPICard } from "@/components/dashboard/PetrolKPICard";
import { NetSalesKPICard } from "@/components/dashboard/NetSalesKPICard";
import { ProfitKPICard } from "@/components/dashboard/ProfitKPICard";
import { AvgPPLKPICard } from "@/components/dashboard/AvgPPLKPICard";
import { ActualPPLKPICard } from "@/components/dashboard/ActualPPLKPICard";
import { LabourCostKPICard } from "@/components/dashboard/LabourCostKPICard";
import { ActiveSitesKPICard } from "@/components/dashboard/ActiveSitesKPICard";
import { ProfitMarginKPICard } from "@/components/dashboard/ProfitMarginKPICard";
import { AvgSalePerSiteKPICard } from "@/components/dashboard/AvgSalePerSiteKPICard";
import { TotalPurchasesKPICard } from "@/components/dashboard/TotalPurchasesKPICard";
import { BankBalanceKPICard } from "@/components/dashboard/BankBalanceKPICard";
import { BankClosingBalanceCard } from "@/components/dashboard/BankClosingBalanceCard";
import { BunkeredBreakdownCard } from "@/components/dashboard/BunkeredBreakdownCard";
import { NonBunkeredBreakdownCard } from "@/components/dashboard/NonBunkeredBreakdownCard";
import { OtherIncomeBreakdownCard } from "@/components/dashboard/OtherIncomeBreakdownCard";
import { CardDetailModal, DetailItem } from "@/components/dashboard/CardDetailModal";
import { MonthlyFuelPerformanceChart } from "@/components/dashboard/MonthlyFuelPerformanceChart";
import { DateWiseDataChart } from "@/components/dashboard/DateWiseDataChart";
import { PPLComparisonChart } from "@/components/dashboard/PPLComparisonChart";
import { ProfitDistributionChart } from "@/components/dashboard/ProfitDistributionChart";
import { PetrolTopPerformingSitesTable } from "@/components/dashboard/PetrolTopPerformingSitesTable";
import { PetrolSitesNeedingImprovementTable } from "@/components/dashboard/PetrolSitesNeedingImprovementTable";
import { format, subDays } from "date-fns";

const PetrolData = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [totalSalesAllSites, setTotalSalesAllSites] = useState(null);
  
  // Date range state - default to last 30 days
  const getDefaultDates = () => {
    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
  };
  
  const defaultDates = getDefaultDates();
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);
  
  // Fuel volume state
  const [totalFuelVolume, setTotalFuelVolume] = useState(null);
  const [loadingFuelVolume, setLoadingFuelVolume] = useState(false);
  const [fuelVolumeError, setFuelVolumeError] = useState(null);

  // Net sales state
  const [totalNetSales, setTotalNetSales] = useState(null);
  const [loadingNetSales, setLoadingNetSales] = useState(false);
  const [netSalesError, setNetSalesError] = useState(null);

  // Breakdown modal state
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [breakdownError, setBreakdownError] = useState(null);

  // Net sales breakdown modal state
  const [netSalesBreakdownModalOpen, setNetSalesBreakdownModalOpen] = useState(false);
  const [netSalesBreakdownData, setNetSalesBreakdownData] = useState(null);
  const [loadingNetSalesBreakdown, setLoadingNetSalesBreakdown] = useState(false);
  const [netSalesBreakdownError, setNetSalesBreakdownError] = useState(null);

  // Profit state
  const [totalProfit, setTotalProfit] = useState(null);
  const [loadingProfit, setLoadingProfit] = useState(false);
  const [profitError, setProfitError] = useState(null);
  const [profitBreakdownModalOpen, setProfitBreakdownModalOpen] = useState(false);
  const [profitBreakdownData, setProfitBreakdownData] = useState(null);
  const [loadingProfitBreakdown, setLoadingProfitBreakdown] = useState(false);
  const [profitBreakdownError, setProfitBreakdownError] = useState(null);

  // Avg PPL state
  const [avgPPL, setAvgPPL] = useState(null);
  const [loadingAvgPPL, setLoadingAvgPPL] = useState(false);
  const [avgPPLError, setAvgPPLError] = useState(null);

  // Actual PPL state
  const [actualPPL, setActualPPL] = useState(null);
  const [loadingActualPPL, setLoadingActualPPL] = useState(false);
  const [actualPPLError, setActualPPLError] = useState(null);
  const [actualPPLBreakdownModalOpen, setActualPPLBreakdownModalOpen] = useState(false);
  const [actualPPLBreakdownData, setActualPPLBreakdownData] = useState(null);
  const [loadingActualPPLBreakdown, setLoadingActualPPLBreakdown] = useState(false);
  const [actualPPLBreakdownError, setActualPPLBreakdownError] = useState(null);

  // Labour cost state
  const [totalLabourCost, setTotalLabourCost] = useState(null);
  const [loadingLabourCost, setLoadingLabourCost] = useState(false);
  const [labourCostError, setLabourCostError] = useState(null);
  const [labourCostBreakdownModalOpen, setLabourCostBreakdownModalOpen] = useState(false);
  const [labourCostBreakdownData, setLabourCostBreakdownData] = useState(null);
  const [loadingLabourCostBreakdown, setLoadingLabourCostBreakdown] = useState(false);
  const [labourCostBreakdownError, setLabourCostBreakdownError] = useState(null);

  // Active sites state
  const [activeSites, setActiveSites] = useState(null);
  const [loadingActiveSites, setLoadingActiveSites] = useState(false);
  const [activeSitesError, setActiveSitesError] = useState(null);

  // Profit margin state
  const [profitMargin, setProfitMargin] = useState(null);
  const [loadingProfitMargin, setLoadingProfitMargin] = useState(false);
  const [profitMarginError, setProfitMarginError] = useState(null);

  // Avg sale per site state
  const [avgSalePerSite, setAvgSalePerSite] = useState(null);
  const [loadingAvgSalePerSite, setLoadingAvgSalePerSite] = useState(false);
  const [avgSalePerSiteError, setAvgSalePerSiteError] = useState(null);

  // Total purchases state
  const [totalPurchases, setTotalPurchases] = useState(null);
  const [loadingTotalPurchases, setLoadingTotalPurchases] = useState(false);
  const [totalPurchasesError, setTotalPurchasesError] = useState(null);
  const [totalPurchasesBreakdownModalOpen, setTotalPurchasesBreakdownModalOpen] = useState(false);
  const [totalPurchasesBreakdownData, setTotalPurchasesBreakdownData] = useState(null);
  const [loadingTotalPurchasesBreakdown, setLoadingTotalPurchasesBreakdown] = useState(false);
  const [totalPurchasesBreakdownError, setTotalPurchasesBreakdownError] = useState(null);

  // Bank balance state
  const [bankBalance, setBankBalance] = useState(null);
  const [loadingBankBalance, setLoadingBankBalance] = useState(false);
  const [bankBalanceError, setBankBalanceError] = useState(null);
  const [bankBalanceBreakdownModalOpen, setBankBalanceBreakdownModalOpen] = useState(false);
  const [bankBalanceBreakdownData, setBankBalanceBreakdownData] = useState(null);
  const [loadingBankBalanceBreakdown, setLoadingBankBalanceBreakdown] = useState(false);
  const [bankBalanceBreakdownError, setBankBalanceBreakdownError] = useState(null);

  // Breakdown cards state
  const [bunkeredData, setBunkeredData] = useState(null);
  const [loadingBunkered, setLoadingBunkered] = useState(false);
  const [bunkeredError, setBunkeredError] = useState(null);

  const [nonBunkeredData, setNonBunkeredData] = useState(null);
  const [loadingNonBunkered, setLoadingNonBunkered] = useState(false);
  const [nonBunkeredError, setNonBunkeredError] = useState(null);

  const [otherIncomeTotal, setOtherIncomeTotal] = useState(null);
  const [loadingOtherIncome, setLoadingOtherIncome] = useState(false);
  const [otherIncomeError, setOtherIncomeError] = useState(null);
  const [otherIncomeBreakdownModalOpen, setOtherIncomeBreakdownModalOpen] = useState(false);
  const [otherIncomeBreakdownData, setOtherIncomeBreakdownData] = useState(null);
  const [loadingOtherIncomeBreakdown, setLoadingOtherIncomeBreakdown] = useState(false);
  const [otherIncomeBreakdownError, setOtherIncomeBreakdownError] = useState(null);

  // Handle responsive sidebar on resize
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

  // Fetch total sales across all sites (all months, all years)
  useEffect(() => {
    const fetchTotalSales = async () => {
      try {
        // Get all sales data (no month/year filter) - shows grand total
        console.log('📊 [PetrolData] Fetching total sales across all sites (all data):');
        
        const totalSalesData = await dashboardAPI.getTotalSales(null, null);
        setTotalSalesAllSites(totalSalesData?.totalSales || 0);
        
        console.log('✅ [PetrolData] Total sales across all sites received:', {
          totalSales: totalSalesData?.totalSales,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching total sales:', error);
        setTotalSalesAllSites(0);
      }
    };

    fetchTotalSales();
  }, []); // Only fetch once on mount

  // Fetch fuel volume when date range changes
  useEffect(() => {
    const fetchFuelVolume = async () => {
      if (!startDate || !endDate) {
        return;
      }

      try {
        setLoadingFuelVolume(true);
        setFuelVolumeError(null);
        
        console.log('⛽ [PetrolData] Fetching fuel volume:', { startDate, endDate });
        
        const data = await dashboardAPI.getPetrolFuelVolume(startDate, endDate);
        setTotalFuelVolume(data?.totalFuelVolume || 0);
        
        console.log('✅ [PetrolData] Fuel volume received:', {
          totalFuelVolume: data?.totalFuelVolume,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching fuel volume:', error);
        setFuelVolumeError(error.message || 'Failed to fetch fuel volume');
        setTotalFuelVolume(0);
      } finally {
        setLoadingFuelVolume(false);
      }
    };

    fetchFuelVolume();
  }, [startDate, endDate]);

  // Fetch net sales when date range changes
  useEffect(() => {
    const fetchNetSales = async () => {
      if (!startDate || !endDate) {
        return;
      }

      try {
        setLoadingNetSales(true);
        setNetSalesError(null);
        
        console.log('💰 [PetrolData] Fetching net sales:', { startDate, endDate });
        
        const data = await dashboardAPI.getPetrolNetSales(startDate, endDate);
        setTotalNetSales(data?.totalNetSales || 0);
        
        console.log('✅ [PetrolData] Net sales received:', {
          totalNetSales: data?.totalNetSales,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching net sales:', error);
        setNetSalesError(error.message || 'Failed to fetch net sales');
        setTotalNetSales(0);
      } finally {
        setLoadingNetSales(false);
      }
    };

    fetchNetSales();
  }, [startDate, endDate]);

  // Fetch profit when date range changes
  useEffect(() => {
    const fetchProfit = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoadingProfit(true);
        setProfitError(null);
        const data = await dashboardAPI.getPetrolProfit(startDate, endDate);
        setTotalProfit(data?.totalProfit || 0);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching profit:', error);
        setProfitError(error.message || 'Failed to fetch profit');
        setTotalProfit(0);
      } finally {
        setLoadingProfit(false);
      }
    };
    fetchProfit();
  }, [startDate, endDate]);

  // Fetch avg PPL when date range changes
  useEffect(() => {
    const fetchAvgPPL = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoadingAvgPPL(true);
        setAvgPPLError(null);
        const data = await dashboardAPI.getPetrolAvgPPL(startDate, endDate);
        setAvgPPL(data?.avgPPL || 0);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching avg PPL:', error);
        setAvgPPLError(error.message || 'Failed to fetch avg PPL');
        setAvgPPL(0);
      } finally {
        setLoadingAvgPPL(false);
      }
    };
    fetchAvgPPL();
  }, [startDate, endDate]);

  // Fetch actual PPL when date range changes
  useEffect(() => {
    const fetchActualPPL = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoadingActualPPL(true);
        setActualPPLError(null);
        const data = await dashboardAPI.getPetrolActualPPL(startDate, endDate);
        setActualPPL(data?.actualPPL || 0);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching actual PPL:', error);
        setActualPPLError(error.message || 'Failed to fetch actual PPL');
        setActualPPL(0);
      } finally {
        setLoadingActualPPL(false);
      }
    };
    fetchActualPPL();
  }, [startDate, endDate]);

  // Fetch labour cost when date range changes
  useEffect(() => {
    const fetchLabourCost = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoadingLabourCost(true);
        setLabourCostError(null);
        const data = await dashboardAPI.getPetrolLabourCost(startDate, endDate);
        setTotalLabourCost(data?.totalLabourCost || 0);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching labour cost:', error);
        setLabourCostError(error.message || 'Failed to fetch labour cost');
        setTotalLabourCost(0);
      } finally {
        setLoadingLabourCost(false);
      }
    };
    fetchLabourCost();
  }, [startDate, endDate]);

  // Fetch active sites when date range changes
  useEffect(() => {
    const fetchActiveSites = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoadingActiveSites(true);
        setActiveSitesError(null);
        const data = await dashboardAPI.getPetrolActiveSites(startDate, endDate);
        setActiveSites(data?.activeSites || 0);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching active sites:', error);
        setActiveSitesError(error.message || 'Failed to fetch active sites');
        setActiveSites(0);
      } finally {
        setLoadingActiveSites(false);
      }
    };
    fetchActiveSites();
  }, [startDate, endDate]);

  // Fetch profit margin when date range changes
  useEffect(() => {
    const fetchProfitMargin = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoadingProfitMargin(true);
        setProfitMarginError(null);
        const data = await dashboardAPI.getPetrolProfitMargin(startDate, endDate);
        setProfitMargin(data?.profitMargin || 0);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching profit margin:', error);
        setProfitMarginError(error.message || 'Failed to fetch profit margin');
        setProfitMargin(0);
      } finally {
        setLoadingProfitMargin(false);
      }
    };
    fetchProfitMargin();
  }, [startDate, endDate]);

  // Fetch avg sale per site when date range changes
  useEffect(() => {
    const fetchAvgSalePerSite = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoadingAvgSalePerSite(true);
        setAvgSalePerSiteError(null);
        const data = await dashboardAPI.getPetrolAvgSalePerSite(startDate, endDate);
        setAvgSalePerSite(data?.avgSalePerSite || 0);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching avg sale per site:', error);
        setAvgSalePerSiteError(error.message || 'Failed to fetch avg sale per site');
        setAvgSalePerSite(0);
      } finally {
        setLoadingAvgSalePerSite(false);
      }
    };
    fetchAvgSalePerSite();
  }, [startDate, endDate]);

  // Fetch total purchases when date range changes
  useEffect(() => {
    const fetchTotalPurchases = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoadingTotalPurchases(true);
        setTotalPurchasesError(null);
        const data = await dashboardAPI.getPetrolTotalPurchases(startDate, endDate);
        setTotalPurchases(data?.totalPurchases || 0);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching total purchases:', error);
        setTotalPurchasesError(error.message || 'Failed to fetch total purchases');
        setTotalPurchases(0);
      } finally {
        setLoadingTotalPurchases(false);
      }
    };
    fetchTotalPurchases();
  }, [startDate, endDate]);

  // Fetch bank balance when endDate changes (only endDate needed)
  useEffect(() => {
    const fetchBankBalance = async () => {
      if (!endDate) return;
      try {
        setLoadingBankBalance(true);
        setBankBalanceError(null);
        const data = await dashboardAPI.getPetrolBankBalance(endDate);
        setBankBalance(data?.totalBalance || 0);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching bank balance:', error);
        setBankBalanceError(error.message || 'Failed to fetch bank balance');
        setBankBalance(0);
      } finally {
        setLoadingBankBalance(false);
      }
    };
    fetchBankBalance();
  }, [endDate]);

  // Fetch bunkered breakdown when date range changes
  useEffect(() => {
    const fetchBunkered = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoadingBunkered(true);
        setBunkeredError(null);
        const data = await dashboardAPI.getPetrolBunkeredBreakdown(startDate, endDate);
        setBunkeredData(data);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching bunkered breakdown:', error);
        setBunkeredError(error.message || 'Failed to fetch bunkered data');
        setBunkeredData(null);
      } finally {
        setLoadingBunkered(false);
      }
    };
    fetchBunkered();
  }, [startDate, endDate]);

  // Fetch non-bunkered breakdown when date range changes
  useEffect(() => {
    const fetchNonBunkered = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoadingNonBunkered(true);
        setNonBunkeredError(null);
        const data = await dashboardAPI.getPetrolNonBunkeredBreakdown(startDate, endDate);
        setNonBunkeredData(data);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching non-bunkered breakdown:', error);
        setNonBunkeredError(error.message || 'Failed to fetch non-bunkered data');
        setNonBunkeredData(null);
      } finally {
        setLoadingNonBunkered(false);
      }
    };
    fetchNonBunkered();
  }, [startDate, endDate]);

  // Fetch other income summary when date range changes
  useEffect(() => {
    const fetchOtherIncome = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoadingOtherIncome(true);
        setOtherIncomeError(null);
        const data = await dashboardAPI.getPetrolOtherIncomeSummary(startDate, endDate);
        setOtherIncomeTotal(data?.total || 0);
      } catch (error) {
        console.error('❌ [PetrolData] Error fetching other income summary:', error);
        setOtherIncomeError(error.message || 'Failed to fetch other income');
        setOtherIncomeTotal(0);
      } finally {
        setLoadingOtherIncome(false);
      }
    };
    fetchOtherIncome();
  }, [startDate, endDate]);

  // Handle date range change
  const handleDateRangeChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Handle KPI card click - fetch breakdown
  const handleKPICardClick = async () => {
    if (!startDate || !endDate) {
      return;
    }

    try {
      setBreakdownModalOpen(true);
      setLoadingBreakdown(true);
      setBreakdownError(null);
      
      console.log('⛽ [PetrolData] Fetching fuel volume breakdown:', { startDate, endDate });
      
      const data = await dashboardAPI.getPetrolFuelVolumeBreakdown(startDate, endDate);
      setBreakdownData(data);
      
      console.log('✅ [PetrolData] Fuel volume breakdown received:', {
        breakdown: data?.breakdown,
        totalVolume: data?.totalVolume,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [PetrolData] Error fetching fuel volume breakdown:', error);
      setBreakdownError(error.message || 'Failed to fetch breakdown');
      setBreakdownData(null);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  // Handle Net Sales KPI card click - fetch breakdown
  const handleNetSalesCardClick = async () => {
    if (!startDate || !endDate) return;
    try {
      setNetSalesBreakdownModalOpen(true);
      setLoadingNetSalesBreakdown(true);
      setNetSalesBreakdownError(null);
      const data = await dashboardAPI.getPetrolNetSalesBreakdown(startDate, endDate);
      setNetSalesBreakdownData(data);
    } catch (error) {
      console.error('❌ [PetrolData] Error fetching net sales breakdown:', error);
      setNetSalesBreakdownError(error.message || 'Failed to fetch breakdown');
      setNetSalesBreakdownData(null);
    } finally {
      setLoadingNetSalesBreakdown(false);
    }
  };

  // Handle Profit KPI card click
  const handleProfitCardClick = async () => {
    if (!startDate || !endDate) return;
    try {
      setProfitBreakdownModalOpen(true);
      setLoadingProfitBreakdown(true);
      setProfitBreakdownError(null);
      const data = await dashboardAPI.getPetrolProfitBreakdown(startDate, endDate);
      setProfitBreakdownData(data);
    } catch (error) {
      console.error('❌ [PetrolData] Error fetching profit breakdown:', error);
      setProfitBreakdownError(error.message || 'Failed to fetch breakdown');
      setProfitBreakdownData(null);
    } finally {
      setLoadingProfitBreakdown(false);
    }
  };

  // Handle Actual PPL KPI card click
  const handleActualPPLCardClick = async () => {
    if (!startDate || !endDate) return;
    try {
      setActualPPLBreakdownModalOpen(true);
      setLoadingActualPPLBreakdown(true);
      setActualPPLBreakdownError(null);
      const data = await dashboardAPI.getPetrolActualPPLBreakdown(startDate, endDate);
      setActualPPLBreakdownData(data);
    } catch (error) {
      console.error('❌ [PetrolData] Error fetching actual PPL breakdown:', error);
      setActualPPLBreakdownError(error.message || 'Failed to fetch breakdown');
      setActualPPLBreakdownData(null);
    } finally {
      setLoadingActualPPLBreakdown(false);
    }
  };

  // Handle Labour Cost KPI card click
  const handleLabourCostCardClick = async () => {
    if (!startDate || !endDate) return;
    try {
      setLabourCostBreakdownModalOpen(true);
      setLoadingLabourCostBreakdown(true);
      setLabourCostBreakdownError(null);
      const data = await dashboardAPI.getPetrolLabourCostBreakdown(startDate, endDate);
      setLabourCostBreakdownData(data);
    } catch (error) {
      console.error('❌ [PetrolData] Error fetching labour cost breakdown:', error);
      setLabourCostBreakdownError(error.message || 'Failed to fetch breakdown');
      setLabourCostBreakdownData(null);
    } finally {
      setLoadingLabourCostBreakdown(false);
    }
  };

  // Handle Total Purchases KPI card click
  const handleTotalPurchasesCardClick = async () => {
    if (!startDate || !endDate) return;
    try {
      setTotalPurchasesBreakdownModalOpen(true);
      setLoadingTotalPurchasesBreakdown(true);
      setTotalPurchasesBreakdownError(null);
      const data = await dashboardAPI.getPetrolTotalPurchasesBreakdown(startDate, endDate);
      setTotalPurchasesBreakdownData(data);
    } catch (error) {
      console.error('❌ [PetrolData] Error fetching total purchases breakdown:', error);
      setTotalPurchasesBreakdownError(error.message || 'Failed to fetch breakdown');
      setTotalPurchasesBreakdownData(null);
    } finally {
      setLoadingTotalPurchasesBreakdown(false);
    }
  };

  // Handle Bank Balance KPI card click
  const handleBankBalanceCardClick = async () => {
    if (!endDate) return;
    try {
      setBankBalanceBreakdownModalOpen(true);
      setLoadingBankBalanceBreakdown(true);
      setBankBalanceBreakdownError(null);
      const data = await dashboardAPI.getPetrolBankBalanceBreakdown(endDate);
      setBankBalanceBreakdownData(data);
    } catch (error) {
      console.error('❌ [PetrolData] Error fetching bank balance breakdown:', error);
      setBankBalanceBreakdownError(error.message || 'Failed to fetch breakdown');
      setBankBalanceBreakdownData(null);
    } finally {
      setLoadingBankBalanceBreakdown(false);
    }
  };

  // Handle Other Income card click
  const handleOtherIncomeCardClick = async () => {
    if (!startDate || !endDate) return;
    try {
      setOtherIncomeBreakdownModalOpen(true);
      setLoadingOtherIncomeBreakdown(true);
      setOtherIncomeBreakdownError(null);
      // Use the same breakdown endpoint as Net Sales (Other Income part)
      const data = await dashboardAPI.getPetrolNetSalesBreakdown(startDate, endDate);
      // Extract only the other income breakdown part
      if (data?.breakdown) {
        const otherIncomeBreakdown = data.breakdown.filter(item => 
          item.code && ['6100', '6101', '6102'].includes(item.code)
        );
        setOtherIncomeBreakdownData({
          breakdown: otherIncomeBreakdown,
          totalOtherIncome: data.totalOtherIncome || 0,
          startDate: data.startDate,
          endDate: data.endDate
        });
      }
    } catch (error) {
      console.error('❌ [PetrolData] Error fetching other income breakdown:', error);
      setOtherIncomeBreakdownError(error.message || 'Failed to fetch breakdown');
      setOtherIncomeBreakdownData(null);
    } finally {
      setLoadingOtherIncomeBreakdown(false);
    }
  };

  // Format volume helper
  const formatVolume = (liters) => {
    if (!liters && liters !== 0) return "0 L";
    if (liters >= 1000000) return `${(liters / 1000000).toFixed(2)} M L`;
    if (liters >= 1000) return `${(liters / 1000).toFixed(0)} K L`;
    return `${liters.toFixed(2)} L`;
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "£0";
    if (amount >= 1000000) return `£${(amount / 1000000).toFixed(2)} M`;
    if (amount >= 1000) return `£${(amount / 1000).toFixed(0)} K`;
    return `£${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div>
        <main 
          style={{ willChange: 'margin-left' }}
          className={`transition-[margin-left] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} ml-0`}
        >
          <Header 
            sidebarOpen={sidebarOpen} 
            onToggleSidebar={toggleSidebar} 
            totalSales={totalSalesAllSites}
          />
          
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Page Title */}
            <div className="mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Fuel className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">Petrol Data</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">View and manage petrol station data</p>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="chart-card mb-3 sm:mb-4 lg:mb-6 animate-slide-up">
              <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm lg:text-base font-semibold text-foreground">
                    Date Range Filter
                  </span>
                </div>
              </div>
              <div className="w-full sm:max-w-md">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onDateChange={handleDateRangeChange}
                />
              </div>
            </div>

            {/* Main KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 xl:gap-5 mb-3 sm:mb-4 lg:mb-6">
              <PetrolKPICard
                totalFuelVolume={totalFuelVolume}
                loading={loadingFuelVolume}
                error={fuelVolumeError}
                onClick={handleKPICardClick}
              />
              <NetSalesKPICard
                totalNetSales={totalNetSales}
                loading={loadingNetSales}
                error={netSalesError}
                onClick={handleNetSalesCardClick}
              />
              <ProfitKPICard
                totalProfit={totalProfit}
                loading={loadingProfit}
                error={profitError}
                onClick={handleProfitCardClick}
              />
              <AvgPPLKPICard
                avgPPL={avgPPL}
                loading={loadingAvgPPL}
                error={avgPPLError}
              />
              <ActualPPLKPICard
                actualPPL={actualPPL}
                loading={loadingActualPPL}
                error={actualPPLError}
                onClick={handleActualPPLCardClick}
              />
              <LabourCostKPICard
                totalLabourCost={totalLabourCost}
                loading={loadingLabourCost}
                error={labourCostError}
                onClick={handleLabourCostCardClick}
              />
            </div>

            {/* Quick Insights Section */}
            <div className="mt-6 sm:mt-8 lg:mt-10">
              <div className="mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground px-3 sm:px-4">
                  Quick Insights
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 xl:gap-5">
                <ActiveSitesKPICard
                  activeSites={activeSites}
                  loading={loadingActiveSites}
                  error={activeSitesError}
                />
                <ProfitMarginKPICard
                  profitMargin={profitMargin}
                  loading={loadingProfitMargin}
                  error={profitMarginError}
                />
                <AvgSalePerSiteKPICard
                  avgSalePerSite={avgSalePerSite}
                  loading={loadingAvgSalePerSite}
                  error={avgSalePerSiteError}
                />
                <TotalPurchasesKPICard
                  totalPurchases={totalPurchases}
                  loading={loadingTotalPurchases}
                  error={totalPurchasesError}
                  onClick={handleTotalPurchasesCardClick}
                />
              </div>
            </div>

            {/* Breakdown Cards Section */}
            <div className="mt-6 sm:mt-8 lg:mt-10">
              <div className="mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground px-3 sm:px-4">
                  Breakdown Cards
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Bank Closing Balance - Full Width */}
              <div className="mb-4 sm:mb-5 lg:mb-6">
                <BankClosingBalanceCard
                  totalBalance={bankBalance}
                  loading={loadingBankBalance}
                  error={bankBalanceError}
                  onClick={handleBankBalanceCardClick}
                />
              </div>

              {/* Bunkered, Non-Bunkered, Other Income - 3 Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                <BunkeredBreakdownCard
                  volume={bunkeredData?.volume}
                  sales={bunkeredData?.sales}
                  profit={bunkeredData?.profit}
                  loading={loadingBunkered}
                  error={bunkeredError}
                />
                <NonBunkeredBreakdownCard
                  volume={nonBunkeredData?.volume}
                  sales={nonBunkeredData?.sales}
                  profit={nonBunkeredData?.profit}
                  loading={loadingNonBunkered}
                  error={nonBunkeredError}
                />
                <OtherIncomeBreakdownCard
                  total={otherIncomeTotal}
                  loading={loadingOtherIncome}
                  error={otherIncomeError}
                  onClick={handleOtherIncomeCardClick}
                />
              </div>
            </div>

            {/* Charts Section */}
            <div className="mt-6 sm:mt-8 lg:mt-10">
              <div className="mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground px-3 sm:px-4">
                  Charts & Graphs
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Row 1: Monthly Fuel Performance (large) */}
              <div className="mb-3 sm:mb-4 lg:mb-6">
                <MonthlyFuelPerformanceChart
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>

              {/* Row 2: Date-wise Data (left, large) + PPL Comparison (right, small) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
                <div className="lg:col-span-2">
                  <DateWiseDataChart
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
                <div className="lg:col-span-1">
                  <PPLComparisonChart
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>

              {/* Row 3: Profit Distribution Donut Chart (full width) */}
              <div className="mb-3 sm:mb-4 lg:mb-6">
                <ProfitDistributionChart
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </div>

            {/* Tables Section */}
            <div className="mt-6 sm:mt-8 lg:mt-10">
              <div className="mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground px-3 sm:px-4">
                  Site Rankings
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Top and Bottom Sites Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <PetrolTopPerformingSitesTable
                  startDate={startDate}
                  endDate={endDate}
                />
                <PetrolSitesNeedingImprovementTable
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Fuel Volume Breakdown Modal */}
      <CardDetailModal
        open={breakdownModalOpen}
        onOpenChange={setBreakdownModalOpen}
        title="Total Fuel Volume Breakdown"
      >
        {loadingBreakdown ? (
          <div className="space-y-2">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </div>
        ) : breakdownError ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Error loading breakdown</p>
            <p className="text-xs text-destructive/80 mt-1">{breakdownError}</p>
          </div>
        ) : breakdownData?.breakdown ? (
          <>
            {breakdownData.breakdown.map((item, index) => (
              <DetailItem
                key={item.code}
                label={item.name}
                value={formatVolume(item.volume)}
                subValue={item.transactionCount > 0 ? `${item.transactionCount.toLocaleString()} transactions` : ''}
              />
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <DetailItem
                isTotal={true}
                label="Total Volume"
                value={formatVolume(breakdownData.totalVolume)}
                subValue={`Date range: ${format(new Date(breakdownData.startDate), 'MMM dd, yyyy')} - ${format(new Date(breakdownData.endDate), 'MMM dd, yyyy')}`}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No breakdown data available</p>
        )}
      </CardDetailModal>

      {/* Net Sales Breakdown Modal */}
      <CardDetailModal
        open={netSalesBreakdownModalOpen}
        onOpenChange={setNetSalesBreakdownModalOpen}
        title="Net Sales Breakdown"
      >
        {loadingNetSalesBreakdown ? (
          <div className="space-y-2">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </div>
        ) : netSalesBreakdownError ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Error loading breakdown</p>
            <p className="text-xs text-destructive/80 mt-1">{netSalesBreakdownError}</p>
          </div>
        ) : netSalesBreakdownData?.breakdown ? (
          <>
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Fuel Sales</p>
              {netSalesBreakdownData.breakdown.filter(item => item.name === 'Bunkered' || item.name === 'Non-Bunkered').map((item) => (
                <DetailItem
                  key={item.code}
                  label={item.name}
                  value={formatCurrency(item.netSales)}
                  subValue={item.transactionCount > 0 ? `${item.transactionCount.toLocaleString()} transactions` : ''}
                />
              ))}
            </div>
            {netSalesBreakdownData.totalFuelSales !== undefined && (
              <div className="mb-3 pt-3 border-t border-border">
                <DetailItem
                  isTotal={false}
                  label="Total Fuel Sales"
                  value={formatCurrency(netSalesBreakdownData.totalFuelSales)}
                  subValue={`Bunkered: ${formatCurrency(netSalesBreakdownData.bunkeredSales || 0)} + Non-Bunkered: ${formatCurrency(netSalesBreakdownData.nonBunkeredSales || 0)}`}
                />
              </div>
            )}
            <div className="mb-3 pt-3 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Other Income</p>
              {netSalesBreakdownData.breakdown.filter(item => item.code && ['6100', '6101', '6102'].includes(item.code)).map((item) => (
                <DetailItem
                  key={item.code}
                  code={item.code}
                  label={`${item.code} - ${item.name}`}
                  value={formatCurrency(item.netSales)}
                  subValue={`${item.transactionCount.toLocaleString()} transactions`}
                />
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <DetailItem
                isTotal={true}
                label="Total Net Sales"
                value={formatCurrency(netSalesBreakdownData.totalNetSales)}
                subValue={`Date range: ${format(new Date(netSalesBreakdownData.startDate), 'MMM dd, yyyy')} - ${format(new Date(netSalesBreakdownData.endDate), 'MMM dd, yyyy')}`}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No breakdown data available</p>
        )}
      </CardDetailModal>

      {/* Profit Breakdown Modal */}
      <CardDetailModal
        open={profitBreakdownModalOpen}
        onOpenChange={setProfitBreakdownModalOpen}
        title="Profit Breakdown"
      >
        {loadingProfitBreakdown ? (
          <div className="space-y-2">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </div>
        ) : profitBreakdownError ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Error loading breakdown</p>
            <p className="text-xs text-destructive/80 mt-1">{profitBreakdownError}</p>
          </div>
        ) : profitBreakdownData ? (
          <>
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Fuel Profit</p>
              {profitBreakdownData.fuelSalesBreakdown?.map((item) => (
                <DetailItem
                  key={item.category}
                  label={item.category}
                  value={formatCurrency(item.fuelProfit)}
                  subValue={`Sales: ${formatCurrency(item.netSales)}, Purchases: ${formatCurrency(item.purchases)}`}
                />
              ))}
            </div>
            {profitBreakdownData.bunkeredProfit !== undefined && profitBreakdownData.nonBunkeredProfit !== undefined && (
              <div className="mb-3 pt-3 border-t border-border">
                <DetailItem
                  isTotal={false}
                  label="Total Fuel Profit"
                  value={formatCurrency(profitBreakdownData.totalFuelProfit || 0)}
                  subValue={`Bunkered: ${formatCurrency(profitBreakdownData.bunkeredProfit || 0)} + Non-Bunkered: ${formatCurrency(profitBreakdownData.nonBunkeredProfit || 0)}`}
                />
              </div>
            )}
            <div className="mb-3 pt-3 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Other Income</p>
              {profitBreakdownData.otherIncomeBreakdown?.map((item) => (
                <DetailItem
                  key={item.code}
                  code={item.code}
                  label={`${item.code} - ${item.name}`}
                  value={formatCurrency(item.amount)}
                  subValue={`${item.transactionCount.toLocaleString()} transactions`}
                />
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <DetailItem
                isTotal={true}
                label="Total Profit"
                value={formatCurrency(profitBreakdownData.totalProfit)}
                subValue={`Date range: ${format(new Date(profitBreakdownData.startDate), 'MMM dd, yyyy')} - ${format(new Date(profitBreakdownData.endDate), 'MMM dd, yyyy')}`}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No breakdown data available</p>
        )}
      </CardDetailModal>

      {/* Actual PPL Breakdown Modal */}
      <CardDetailModal
        open={actualPPLBreakdownModalOpen}
        onOpenChange={setActualPPLBreakdownModalOpen}
        title="Overheads Breakdown"
      >
        {loadingActualPPLBreakdown ? (
          <div className="space-y-2">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </div>
        ) : actualPPLBreakdownError ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Error loading breakdown</p>
            <p className="text-xs text-destructive/80 mt-1">{actualPPLBreakdownError}</p>
          </div>
        ) : actualPPLBreakdownData?.breakdown ? (
          <>
            {actualPPLBreakdownData.breakdown.map((item) => (
              <DetailItem
                key={item.category}
                label={item.category}
                value={formatCurrency(item.amount)}
                subValue={`${item.transactionCount.toLocaleString()} transactions`}
              />
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <DetailItem
                isTotal={true}
                label="Total Overheads"
                value={formatCurrency(actualPPLBreakdownData.totalOverheads)}
                subValue={`Date range: ${format(new Date(actualPPLBreakdownData.startDate), 'MMM dd, yyyy')} - ${format(new Date(actualPPLBreakdownData.endDate), 'MMM dd, yyyy')}`}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No breakdown data available</p>
        )}
      </CardDetailModal>

      {/* Labour Cost Breakdown Modal */}
      <CardDetailModal
        open={labourCostBreakdownModalOpen}
        onOpenChange={setLabourCostBreakdownModalOpen}
        title="Labour Cost Breakdown"
      >
        {loadingLabourCostBreakdown ? (
          <div className="space-y-2">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </div>
        ) : labourCostBreakdownError ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Error loading breakdown</p>
            <p className="text-xs text-destructive/80 mt-1">{labourCostBreakdownError}</p>
          </div>
        ) : labourCostBreakdownData?.breakdown ? (
          <>
            {labourCostBreakdownData.breakdown.map((item) => (
              <DetailItem
                key={item.code}
                code={item.code}
                label={`${item.code} - ${item.name}`}
                value={formatCurrency(item.amount)}
                subValue={`${item.transactionCount.toLocaleString()} transactions`}
              />
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <DetailItem
                isTotal={true}
                label="Total Labour Cost"
                value={formatCurrency(labourCostBreakdownData.totalLabourCost)}
                subValue={`Date range: ${format(new Date(labourCostBreakdownData.startDate), 'MMM dd, yyyy')} - ${format(new Date(labourCostBreakdownData.endDate), 'MMM dd, yyyy')}`}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No breakdown data available</p>
        )}
      </CardDetailModal>

      {/* Total Purchases Breakdown Modal */}
      <CardDetailModal
        open={totalPurchasesBreakdownModalOpen}
        onOpenChange={setTotalPurchasesBreakdownModalOpen}
        title="Total Purchases Breakdown"
      >
        {loadingTotalPurchasesBreakdown ? (
          <div className="space-y-2">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </div>
        ) : totalPurchasesBreakdownError ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Error loading breakdown</p>
            <p className="text-xs text-destructive/80 mt-1">{totalPurchasesBreakdownError}</p>
          </div>
        ) : totalPurchasesBreakdownData?.breakdown ? (
          <>
            {totalPurchasesBreakdownData.breakdown.map((item) => (
              <DetailItem
                key={item.code}
                code={item.code}
                label={`${item.code} - ${item.name}`}
                value={formatCurrency(item.purchases)}
                subValue={`${item.transactionCount.toLocaleString()} transactions`}
              />
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <DetailItem
                isTotal={true}
                label="Total Purchases"
                value={formatCurrency(totalPurchasesBreakdownData.totalPurchases)}
                subValue={`Date range: ${format(new Date(totalPurchasesBreakdownData.startDate), 'MMM dd, yyyy')} - ${format(new Date(totalPurchasesBreakdownData.endDate), 'MMM dd, yyyy')}`}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No breakdown data available</p>
        )}
      </CardDetailModal>

      {/* Bank Balance Breakdown Modal */}
      <CardDetailModal
        open={bankBalanceBreakdownModalOpen}
        onOpenChange={setBankBalanceBreakdownModalOpen}
        title="Bank Balance Breakdown"
      >
        {loadingBankBalanceBreakdown ? (
          <div className="space-y-2">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </div>
        ) : bankBalanceBreakdownError ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Error loading breakdown</p>
            <p className="text-xs text-destructive/80 mt-1">{bankBalanceBreakdownError}</p>
          </div>
        ) : bankBalanceBreakdownData?.breakdown ? (
          <>
            {bankBalanceBreakdownData.breakdown.map((item) => (
              <DetailItem
                key={item.code}
                code={item.code}
                label={`${item.code} - ${item.name}`}
                value={formatCurrency(item.balance)}
                subValue={`${item.transactionCount.toLocaleString()} transactions`}
              />
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <DetailItem
                isTotal={true}
                label="Total Bank Balance"
                value={formatCurrency(bankBalanceBreakdownData.totalBalance)}
                subValue={`As of: ${format(new Date(bankBalanceBreakdownData.endDate), 'MMM dd, yyyy')}`}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No breakdown data available</p>
        )}
      </CardDetailModal>

      {/* Other Income Breakdown Modal */}
      <CardDetailModal
        open={otherIncomeBreakdownModalOpen}
        onOpenChange={setOtherIncomeBreakdownModalOpen}
        title="Other Income Breakdown"
      >
        {loadingOtherIncomeBreakdown ? (
          <div className="space-y-2">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </div>
        ) : otherIncomeBreakdownError ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Error loading breakdown</p>
            <p className="text-xs text-destructive/80 mt-1">{otherIncomeBreakdownError}</p>
          </div>
        ) : otherIncomeBreakdownData?.breakdown ? (
          <>
            {otherIncomeBreakdownData.breakdown.map((item) => (
              <DetailItem
                key={item.code}
                code={item.code}
                label={`${item.code} - ${item.name}`}
                value={formatCurrency(item.netSales || item.amount || 0)}
                subValue={`${item.transactionCount?.toLocaleString() || 0} transactions`}
              />
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <DetailItem
                isTotal={true}
                label="Total Other Income"
                value={formatCurrency(otherIncomeBreakdownData.totalOtherIncome || 0)}
                subValue={`Date range: ${format(new Date(otherIncomeBreakdownData.startDate), 'MMM dd, yyyy')} - ${format(new Date(otherIncomeBreakdownData.endDate), 'MMM dd, yyyy')}`}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No breakdown data available</p>
        )}
      </CardDetailModal>
    </div>
  );
};

export default PetrolData;
