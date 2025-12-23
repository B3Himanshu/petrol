import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sitesData } from "@/data/sitesData";
import { useState, useEffect, useMemo } from "react";

// Clean JSX FilterSection (no TypeScript, no BOM)
export const FilterSection = ({ onApplyFilters, selectedSite, onSiteChange, filtersApplied }) => {
  // Local state for filter selections - these are only applied when "Apply Filters" is clicked
  const [localSelectedSite, setLocalSelectedSite] = useState(selectedSite || "all");
  // Show all sites without city filtering
  const availableSites = useMemo(() => sitesData, []);

  // Sync local state with props when they change externally (e.g., reset)
  useEffect(() => {
    setLocalSelectedSite(selectedSite || "all");
  }, [selectedSite]);

  const handleLocalSiteChange = (value) => {
    setLocalSelectedSite(value);
  };

  const handleApplyFilters = () => {
    // Require a site selection before applying filters
    if (!localSelectedSite || localSelectedSite === 'all') {
      return;
    }
    // Apply the local selection to the actual state
    if (onSiteChange) {
      onSiteChange(localSelectedSite);
    }
    // Trigger the apply filters callback
    onApplyFilters();
  };
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
        {/* Month */}
        <div className="flex-1 min-w-[120px] sm:min-w-[150px]">
          <label className="text-xs font-medium text-primary mb-2 block">
            Month
          </label>
          <Select defaultValue="december">
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="january">January</SelectItem>
              <SelectItem value="february">February</SelectItem>
              <SelectItem value="march">March</SelectItem>
              <SelectItem value="april">April</SelectItem>
              <SelectItem value="may">May</SelectItem>
              <SelectItem value="june">June</SelectItem>
              <SelectItem value="july">July</SelectItem>
              <SelectItem value="august">August</SelectItem>
              <SelectItem value="september">September</SelectItem>
              <SelectItem value="october">October</SelectItem>
              <SelectItem value="november">November</SelectItem>
              <SelectItem value="december">December</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Year */}
        <div className="flex-1 min-w-[120px] sm:min-w-[150px]">
          <label className="text-xs font-medium text-primary mb-2 block">
            Year
          </label>
          <Select defaultValue="2024">
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Site */}
        <div className="flex-1 min-w-[120px] sm:min-w-[150px]">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Site
          </label>
          <Select value={localSelectedSite} onValueChange={handleLocalSiteChange}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {availableSites.map((site) => (
                <SelectItem key={site.id} value={site.id.toString()}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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


