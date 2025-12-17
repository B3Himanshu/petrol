import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const data = [
  { month: "Jan", fuel: 4200, shop: 1800, valet: 1600 },
  { month: "Feb", fuel: 3500, shop: 1700, valet: 1500 },
  { month: "Mar", fuel: 4800, shop: 3000, valet: 1700 },
  { month: "Apr", fuel: 4500, shop: 1900, valet: 1600 },
  { month: "May", fuel: 4900, shop: 2000, valet: 1800 },
  { month: "Jun", fuel: 4600, shop: 1900, valet: 1800 },
  { month: "Jul", fuel: 5000, shop: 3200, valet: 1700 },
  { month: "Aug", fuel: 4800, shop: 2000, valet: 1800 },
  { month: "Sep", fuel: 4700, shop: 2900, valet: 1600 },
  { month: "Oct", fuel: 4900, shop: 3100, valet: 1700 },
  { month: "Nov", fuel: 4600, shop: 2900, valet: 1700 },
  { month: "Dec", fuel: 5800, shop: 3400, valet: 1900 },
];

export const MonthlyPerformanceChart = () => {
  // JSX version: no TypeScript generic on useState
  const [viewType, setViewType] = useState("bar");
  const [filterType, setFilterType] = useState(null); // null = all, "fuel", "shop", "valet"
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="chart-card h-[420px] animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Monthly Performance Trends</h3>
        <div className="flex items-center gap-2">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setFilterType(null);
                    setFilterOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    filterType === null
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setFilterType("fuel");
                    setFilterOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    filterType === "fuel"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  Fuel
                </button>
                <button
                  onClick={() => {
                    setFilterType("shop");
                    setFilterOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    filterType === "shop"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  Shop
                </button>
                <button
                  onClick={() => {
                    setFilterType("valet");
                    setFilterOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    filterType === "valet"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  Valet
                </button>
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewType("bar")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors",
                viewType === "bar"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Bar
            </button>
            <button
              onClick={() => setViewType("line")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors",
                viewType === "line"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        {viewType === "bar" ? (
          <BarChart data={data} barGap={2} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value, name) => {
                // Show breakdown for fuel sales and fuel volume
                if (name === "fuel") {
                  const bunkered = Math.round(value * 0.6);
                  const nonBunkered = Math.round(value * 0.4);
                  return [
                    `Total: £${value.toLocaleString()}\nBunkered: £${bunkered.toLocaleString()}\nNon-Bunkered: £${nonBunkered.toLocaleString()}`,
                    "Fuel Sales"
                  ];
                }
                return [`£${value.toLocaleString()}`, name];
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value) => (
                <span className="text-sm capitalize text-muted-foreground">{value}</span>
              )}
            />
            <Bar dataKey="fuel" fill="hsl(var(--chart-blue))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="shop" fill="hsl(var(--chart-green))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="valet" fill="hsl(var(--chart-yellow))" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value) => (
                <span className="text-sm capitalize text-muted-foreground">{value}</span>
              )}
            />
            <Line type="monotone" dataKey="fuel" stroke="hsl(var(--chart-blue))" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="shop" stroke="hsl(var(--chart-green))" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="valet" stroke="hsl(var(--chart-yellow))" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
