import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

const siteData = [
  { name: "Site 1", value: 210000, color: "#3b82f6" },
  { name: "Site 2", value: 180000, color: "#10b981" },
  { name: "Site 3", value: 165000, color: "#f59e0b" },
  { name: "Site 4", value: 150000, color: "#f97316" },
  { name: "Site 5", value: 135000, color: "#8b5cf6" },
  { name: "Site 6", value: 120000, color: "#ec4899" },
  { name: "Site 7", value: 110000, color: "#06b6d4" },
  { name: "Site 8", value: 100000, color: "#84cc16" },
  { name: "Site 9", value: 95000, color: "#f43f5e" },
  { name: "Site 10", value: 90000, color: "#a855f7" },
];

const total = siteData.reduce((sum, item) => sum + item.value, 0);

export const SalesDistributionChart = () => {
  return (
    <div className="chart-card animate-slide-up" style={{ animationDelay: "600ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Sales Distribution by Site
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={siteData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {siteData.map((entry, index) => (
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
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Table */}
        <div className="overflow-y-auto max-h-64">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold text-foreground">Site</th>
                <th className="text-right py-2 px-3 font-semibold text-foreground">Sales</th>
              </tr>
            </thead>
            <tbody>
              {siteData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-border/60 hover:bg-muted/40 transition-colors"
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right text-foreground">
                    £{item.value.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-border font-semibold">
                <td className="py-2 px-3 text-foreground">Total</td>
                <td className="py-2 px-3 text-right text-foreground">
                  £{total.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

