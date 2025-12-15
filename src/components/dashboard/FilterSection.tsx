import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const FilterSection = () => {
  return (
    <div className="chart-card mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">Filters</span>
        </div>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Reset
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-medium text-primary mb-2 block">Month</label>
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

        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-medium text-primary mb-2 block">Year</label>
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

        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Site</label>
          <Select defaultValue="all">
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              <SelectItem value="site1">Site 1</SelectItem>
              <SelectItem value="site2">Site 2</SelectItem>
              <SelectItem value="site3">Site 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
