import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { Filter } from "lucide-react";

const data = [
  { month: "Jan", actualPPI: 78 },
  { month: "Feb", actualPPI: 82 },
  { month: "Mar", actualPPI: 79 },
  { month: "Apr", actualPPI: 81 },
  { month: "May", actualPPI: 83 },
  { month: "Jun", actualPPI: 88 },
  { month: "Jul", actualPPI: 82 },
  { month: "Aug", actualPPI: 81 },
  { month: "Sep", actualPPI: 80 },
  { month: "Oct", actualPPI: 84 },
  { month: "Nov", actualPPI: 86 },
  { month: "Dec", actualPPI: 88 },
];

const avgPPI = 84;

export const PPIChart = () => {
  return (
    <div className="chart-card h-[380px] animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Avg PPI vs Actual PPI (Line chart)</h3>
          <p className="text-sm text-muted-foreground">This chart has filter button.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis 
            domain={[70, 100]}
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
              <span className="text-sm text-muted-foreground">
                {value === "actualPPI" ? "Actual PPI" : "Avg PPI"}
              </span>
            )}
          />
          <ReferenceLine 
            y={avgPPI} 
            stroke="hsl(var(--chart-purple))" 
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: "Avg PPI", fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Line 
            type="monotone" 
            dataKey="actualPPI" 
            stroke="hsl(var(--chart-blue))" 
            strokeWidth={2} 
            dot={{ r: 4, fill: "hsl(var(--chart-blue))" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
