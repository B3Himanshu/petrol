import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

const salesData = [
  { name: "Non-bunkered Sales", value: 1430000, color: "#10b981" },
  { name: "Bunkered Sales", value: 1000000, color: "#3b82f6" },
  { name: "Shop Sales", value: 40000, color: "#f59e0b" },
  { name: "Valet Sales", value: 17000, color: "#8b5cf6" },
];

export const OverallSalesPieChart = () => {
  return (
    <div className="chart-card h-[420px] animate-slide-up" style={{ animationDelay: "400ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Overall Sales (Pie Chart)
      </h3>
      
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={salesData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {salesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`£${value.toLocaleString()}`, "Sales"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-muted-foreground mt-4 text-center">
        It will represent Non-bunkered sales, Bunkered sales, Shop sales, Valet Sales.
      </p>
    </div>
  );
};

