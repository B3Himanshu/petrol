import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { month: "Jan", bunkered: 2600, nonBunkered: 1800 },
  { month: "Feb", bunkered: 2400, nonBunkered: 1600 },
  { month: "Mar", bunkered: 2900, nonBunkered: 2100 },
  { month: "Apr", bunkered: 2600, nonBunkered: 1700 },
  { month: "May", bunkered: 3000, nonBunkered: 2000 },
  { month: "Jun", bunkered: 2700, nonBunkered: 1800 },
];

export const BunkeredSalesChart = () => {
  return (
    <div className="chart-card h-[380px] animate-slide-up" style={{ animationDelay: "350ms" }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Sales Data (Bar-graph)</h3>
        <p className="text-sm text-muted-foreground">Comparing Bunkered vs Non-Bunkered sales</p>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} barGap={4} barCategoryGap="25%">
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
              if (name === "bunkered") {
                return [`Bunkered: £${value.toLocaleString()}`, "Bunkered Sales"];
              } else if (name === "nonBunkered") {
                return [`Non-Bunkered: £${value.toLocaleString()}`, "Non-Bunkered Sales"];
              }
              return [`£${value.toLocaleString()}`, name];
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "10px" }}
            formatter={(value) => (
              <span className="text-sm text-muted-foreground">
                {value === "bunkered" ? "Bunkered" : "Non-Bunkered"}
              </span>
            )}
          />
          <Bar dataKey="bunkered" fill="hsl(var(--chart-blue))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="nonBunkered" fill="hsl(var(--chart-green))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
