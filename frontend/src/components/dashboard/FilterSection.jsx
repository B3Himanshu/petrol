import { Filter, Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { sitesAPI } from "@/services/api";
import { useState, useEffect, useCallback, memo } from "react";

// Constants for dropdown options - extracted for reusability and performance
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
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
              onClick={() => handleToggle(option.value)}
            >
              <Checkbox
                checked={selected.includes(option.value)}
                onCheckedChange={() => handleToggle(option.value)}
              />
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Clean JSX FilterSection (no TypeScript, no BOM)
const FilterSectionComponent = ({ onApplyFilters, selectedSite, onSiteChange, filtersApplied }) => {
  // Local state for filter selections - these are only applied when "Apply Filters" is clicked
  const [localSelectedSite, setLocalSelectedSite] = useState(selectedSite || "all");
  const [localSelectedMonths, setLocalSelectedMonths] = useState(["november"]);
  const [localSelectedYears, setLocalSelectedYears] = useState(["2025"]);
  const [sites, setSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);

  // Fetch sites from API
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

  // Sync local state with props when they change externally (e.g., reset)
  useEffect(() => {
    setLocalSelectedSite(selectedSite || "all");
  }, [selectedSite]);

  const handleLocalSiteChange = useCallback((value) => {
    setLocalSelectedSite(value);
  }, []);

  const handleApplyFilters = useCallback(() => {
    // Require a site selection before applying filters
    if (!localSelectedSite || localSelectedSite === 'all') {
      return;
    }
    // Require at least one month and one year selected
    if (localSelectedMonths.length === 0 || localSelectedYears.length === 0) {
      return;
    }
    
    // Convert month names to numbers
    const monthNumbers = localSelectedMonths.map(month => 
      MONTH_NAME_TO_NUMBER[month.toLowerCase()] || 12
    );
    const yearNumbers = localSelectedYears.map(year => 
      parseInt(year, 10) || new Date().getFullYear()
    );
    
    // Pass the site ID, months array, and years array to onApplyFilters
    onApplyFilters({
      siteId: localSelectedSite,
      months: monthNumbers,
      years: yearNumbers
    });
  }, [localSelectedSite, localSelectedMonths, localSelectedYears, onApplyFilters]);
  return (
    <div className="chart-card mb-4 lg:mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-sm lg:text-base font-semibold text-foreground">
            Filters
          </span>
        </div>
        <button className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors">
          Reset
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 lg:gap-4">
        {/* Site - First */}
        <div className="flex-1 min-w-[120px] sm:min-w-[150px]">
          <label className="text-xs font-medium text-primary mb-2 block">
            Site
          </label>
          <Select value={localSelectedSite} onValueChange={handleLocalSiteChange}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
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

        {/* Year - Second */}
        <div className="flex-1 min-w-[120px] sm:min-w-[150px]">
          <label className="text-xs font-medium text-primary mb-2 block">
            Year
          </label>
          <MultiSelect
            options={YEAR_OPTIONS}
            selected={localSelectedYears}
            onChange={setLocalSelectedYears}
            placeholder="Select year(s)"
            label="year"
          />
        </div>

        {/* Month - Third */}
        <div className="flex-1 min-w-[120px] sm:min-w-[150px]">
          <label className="text-xs font-medium text-primary mb-2 block">
            Month
          </label>
          <MultiSelect
            options={MONTH_OPTIONS}
            selected={localSelectedMonths}
            onChange={setLocalSelectedMonths}
            placeholder="Select month(s)"
            label="month"
          />
        </div>

        <Button 
          onClick={handleApplyFilters}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 lg:px-6 w-full sm:w-auto"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const FilterSection = memo(FilterSectionComponent);
