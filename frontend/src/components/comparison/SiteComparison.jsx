import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { SitePhotoGallery } from "./SitePhotoGallery";
import { ComparisonMetrics } from "./ComparisonMetrics";
import { ComparisonBarChart } from "./ComparisonBarChart";
import { ComparisonPieCharts } from "./ComparisonPieCharts";
import { sitesAPI, dashboardAPI } from "@/services/api";
import { Filter, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Constants for dropdown options
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

// Month name to number mapping
const MONTH_NAME_TO_NUMBER = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

// MultiSelect component for months/years
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
      // If all are selected, clear all
      onChange([]);
    } else {
      // Select all options
      onChange(options.map(opt => opt.value));
    }
  };

  const allSelected = selected.length === options.length && options.length > 0;
  const someSelected = selected.length > 0 && selected.length < options.length;

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
        {/* Select All / Clear All button */}
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
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
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

export const SiteComparison = () => {
  const [sites, setSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);
  
  // Load saved comparison filters from sessionStorage
  const loadSavedComparisonFilters = () => {
    try {
      const saved = sessionStorage.getItem('comparisonFilters');
      if (saved) {
        const filters = JSON.parse(saved);
        return {
          site1: filters.site1 || null,
          site2: filters.site2 || null,
          months: filters.months || ["november"],
          years: filters.years || ["2025"]
        };
      }
    } catch (error) {
      console.error('Error loading saved comparison filters:', error);
    }
    return {
      site1: null,
      site2: null,
      months: ["november"],
      years: ["2025"]
    };
  };

  const savedComparisonFilters = loadSavedComparisonFilters();
  
  // Pending filter states (what user selects) - initialize from saved filters
  const [pendingSite1, setPendingSite1] = useState(savedComparisonFilters.site1);
  const [pendingSite2, setPendingSite2] = useState(savedComparisonFilters.site2);
  const [pendingMonths, setPendingMonths] = useState(savedComparisonFilters.months);
  const [pendingYears, setPendingYears] = useState(savedComparisonFilters.years);
  
  // Applied filter states (what's actually used for data fetching) - initialize from saved filters
  const [appliedSite1, setAppliedSite1] = useState(savedComparisonFilters.site1);
  const [appliedSite2, setAppliedSite2] = useState(savedComparisonFilters.site2);
  const [appliedMonths, setAppliedMonths] = useState(savedComparisonFilters.months);
  const [appliedYears, setAppliedYears] = useState(savedComparisonFilters.years);
  
  // Initialize applied filters on mount (optional - can start with no filters)
  // This allows users to set filters before applying
  
  const [site1Data, setSite1Data] = useState(null);
  const [site2Data, setSite2Data] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Fetch sites
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

  // Fetch comparison data when applied filters change
  useEffect(() => {
    if (!appliedSite1 || !appliedSite2 || appliedSite1 === appliedSite2) {
      setSite1Data(null);
      setSite2Data(null);
      return;
    }

    if (appliedMonths.length === 0 || appliedYears.length === 0) {
      setSite1Data(null);
      setSite2Data(null);
      return;
    }

    const fetchComparisonData = async () => {
      try {
        setLoadingComparison(true);
        // Convert month names to numbers
        const monthNumbers = appliedMonths.map(month => 
          MONTH_NAME_TO_NUMBER[month.toLowerCase()] || 12
        );
        const yearNumbers = appliedYears.map(year => 
          parseInt(year, 10) || new Date().getFullYear()
        );
        
        const [metrics1, metrics2] = await Promise.all([
          dashboardAPI.getMetrics(appliedSite1, monthNumbers, yearNumbers),
          dashboardAPI.getMetrics(appliedSite2, monthNumbers, yearNumbers),
        ]);
        setSite1Data(metrics1);
        setSite2Data(metrics2);
      } catch (error) {
        console.error('Error fetching comparison data:', error);
        setSite1Data(null);
        setSite2Data(null);
      } finally {
        setLoadingComparison(false);
      }
    };

    fetchComparisonData();
  }, [appliedSite1, appliedSite2, appliedMonths, appliedYears]);

  const handleApply = () => {
    // Apply pending filters to actual filters
    setAppliedSite1(pendingSite1);
    setAppliedSite2(pendingSite2);
    setAppliedMonths(pendingMonths);
    setAppliedYears(pendingYears);
    
    // Save filters to sessionStorage
    try {
      sessionStorage.setItem('comparisonFilters', JSON.stringify({
        site1: pendingSite1,
        site2: pendingSite2,
        months: pendingMonths,
        years: pendingYears
      }));
    } catch (error) {
      console.error('Error saving comparison filters:', error);
    }
  };

  const handleClear = () => {
    setPendingSite1(null);
    setPendingSite2(null);
    setPendingMonths(["november"]);
    setPendingYears(["2025"]);
    setAppliedSite1(null);
    setAppliedSite2(null);
    setAppliedMonths(["november"]);
    setAppliedYears(["2025"]);
    setSite1Data(null);
    setSite2Data(null);
    
    // Clear saved filters from sessionStorage
    try {
      sessionStorage.removeItem('comparisonFilters');
    } catch (error) {
      console.error('Error clearing comparison filters:', error);
    }
  };

  const hasPendingChanges = 
    pendingSite1 !== appliedSite1 ||
    pendingSite2 !== appliedSite2 ||
    JSON.stringify(pendingMonths) !== JSON.stringify(appliedMonths) ||
    JSON.stringify(pendingYears) !== JSON.stringify(appliedYears);

  const canCompare = appliedSite1 && appliedSite2 && appliedSite1 !== appliedSite2;

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="chart-card animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm lg:text-base font-semibold text-foreground">
              Comparison Filters
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(pendingSite1 || pendingSite2 || appliedSite1 || appliedSite2) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleApply}
              disabled={!pendingSite1 || !pendingSite2 || pendingSite1 === pendingSite2 || !hasPendingChanges}
              className="text-xs"
            >
              Apply Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Site 1 Selection */}
          <div>
            <label className="text-xs font-medium text-primary mb-2 block">
              Site 1
            </label>
            <Select 
              value={pendingSite1?.toString() || ""} 
              onValueChange={(value) => setPendingSite1(value === "all" ? null : parseInt(value, 10))}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select first site" />
              </SelectTrigger>
              <SelectContent>
                {loadingSites ? (
                  <SelectItem value="loading" disabled>Loading sites...</SelectItem>
                ) : (
                  sites.map((site) => (
                    <SelectItem key={site.id} value={site.id.toString()}>
                      {site.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Site 2 Selection */}
          <div>
            <label className="text-xs font-medium text-primary mb-2 block">
              Site 2
            </label>
            <Select 
              value={pendingSite2?.toString() || ""} 
              onValueChange={(value) => setPendingSite2(value === "all" ? null : parseInt(value, 10))}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select second site" />
              </SelectTrigger>
              <SelectContent>
                {loadingSites ? (
                  <SelectItem value="loading" disabled>Loading sites...</SelectItem>
                ) : (
                  sites.map((site) => (
                    <SelectItem key={site.id} value={site.id.toString()}>
                      {site.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Month Selection - Multi-select */}
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

          {/* Year Selection - Multi-select */}
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
        </div>

        {pendingSite1 === pendingSite2 && pendingSite1 && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Please select two different sites for comparison.
            </p>
          </div>
        )}
      </div>

      {/* Site Photo Galleries */}
      {canCompare && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SitePhotoGallery 
            siteId={appliedSite1} 
            siteName={sites.find(s => s.id === appliedSite1)?.name || "Site 1"}
          />
          <SitePhotoGallery 
            siteId={appliedSite2} 
            siteName={sites.find(s => s.id === appliedSite2)?.name || "Site 2"}
          />
        </div>
      )}

      {/* Comparison Charts */}
      {canCompare && (
        <>
          {/* Bar Chart Comparison */}
          <ComparisonBarChart
            site1Data={site1Data}
            site2Data={site2Data}
            site1Name={sites.find(s => s.id === appliedSite1)?.name || "Site 1"}
            site2Name={sites.find(s => s.id === appliedSite2)?.name || "Site 2"}
            loading={loadingComparison}
          />

          {/* Pie Charts Comparison */}
          <ComparisonPieCharts
            site1Id={appliedSite1}
            site2Id={appliedSite2}
            site1Name={sites.find(s => s.id === appliedSite1)?.name || "Site 1"}
            site2Name={sites.find(s => s.id === appliedSite2)?.name || "Site 2"}
            months={appliedMonths.map(month => MONTH_NAME_TO_NUMBER[month.toLowerCase()] || 12)}
            years={appliedYears.map(year => parseInt(year, 10))}
            loading={loadingComparison}
          />
        </>
      )}

      {/* Comparison Metrics */}
      {canCompare && (
        <ComparisonMetrics 
          site1Data={site1Data}
          site2Data={site2Data}
          site1Name={sites.find(s => s.id === appliedSite1)?.name || "Site 1"}
          site2Name={sites.find(s => s.id === appliedSite2)?.name || "Site 2"}
          loading={loadingComparison}
        />
      )}

      {/* Empty State */}
      {!canCompare && (
        <div className="chart-card h-96 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Filter className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Select Two Sites to Compare
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose two different sites from the filters above to view their comparison
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

