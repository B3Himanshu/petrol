import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const data = [
  { day: 1, sales: 4500 },
  { day: 4, sales: 3800 },
  { day: 7, sales: 4800 },
  { day: 10, sales: 2800 },
  { day: 13, sales: 4600 },
  { day: 16, sales: 3200 },
  { day: 19, sales: 1800 },
  { day: 22, sales: 4200 },
  { day: 25, sales: 4600 },
  { day: 28, sales: 4200 },
  { day: 31, sales: 4457 },
];

export const DateWiseChart = () => {
  return (
    <div className="chart-card h-[380px] animate-slide-up" style={{ animationDelay: "450ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Date-Wise Data (Line chart)</h3>
        <Select defaultValue="december">
          <SelectTrigger className="w-32 bg-background border-border">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="november">November</SelectItem>
            <SelectItem value="december">December</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-blue))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-blue))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="day" 
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
            formatter={(value) => [`₹${value.toLocaleString()}`, "Sales"]}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="sales" 
            stroke="hsl(var(--chart-blue))" 
            strokeWidth={2}
            fill="url(#salesGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
