import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Open", value: 4045, color: "hsl(var(--chart-blue))" },
  { name: "Pending", value: 3245, color: "hsl(var(--chart-green))" },
  { name: "Accepted", value: 1252, color: "hsl(var(--chart-yellow))" },
];

export const OrdersDonutChart = () => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-card h-[380px] animate-slide-up" style={{ animationDelay: "400ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">Orders</h3>
      
      <div className="relative h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Orders</span>
          <span className="text-3xl font-bold text-foreground">{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-lg font-semibold text-foreground">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
