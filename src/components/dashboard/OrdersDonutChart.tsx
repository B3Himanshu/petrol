const data = [
  { name: "Open", value: 4045, color: "#6C63FF" },
  { name: "Pending", value: 3245, color: "#1E88E5" },
  { name: "Accepted", value: 1252, color: "#F4A100" },
];

export const OrdersDonutChart = () => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const circumference = 2 * Math.PI * 70; // ~440

  // Calculate stroke dash arrays based on percentages
  const openDash = (data[0].value / total) * circumference;
  const pendingDash = (data[1].value / total) * circumference;
  const acceptedDash = (data[2].value / total) * circumference;

  return (
    <div className="chart-card animate-slide-up" style={{ animationDelay: "400ms" }}>
      <h3 className="text-sm font-semibold text-foreground mb-4">Orders</h3>
      
      <div className="relative flex justify-center items-center">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r="70"
            stroke="hsl(var(--muted))"
            strokeWidth="14"
            fill="none"
          />

          {/* Open - Purple */}
          <circle
            cx="90"
            cy="90"
            r="70"
            stroke={data[0].color}
            strokeWidth="14"
            fill="none"
            strokeDasharray={`${openDash} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
            className="transition-all duration-500"
          />

          {/* Pending - Blue */}
          <circle
            cx="90"
            cy="90"
            r="70"
            stroke={data[1].color}
            strokeWidth="14"
            fill="none"
            strokeDasharray={`${pendingDash} ${circumference}`}
            strokeDashoffset={-openDash}
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
            className="transition-all duration-500"
          />

          {/* Accepted - Yellow/Orange */}
          <circle
            cx="90"
            cy="90"
            r="70"
            stroke={data[2].color}
            strokeWidth="14"
            fill="none"
            strokeDasharray={`${acceptedDash} ${circumference}`}
            strokeDashoffset={-(openDash + pendingDash)}
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
            className="transition-all duration-500"
          />
        </svg>

        {/* Center text */}
        <div className="absolute text-center">
          <p className="text-[11px] text-muted-foreground mb-0.5">Total Orders</p>
          <h2 className="text-2xl font-bold text-foreground">{total.toLocaleString()}</h2>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between mt-5 px-2">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <span 
              className="inline-block w-2 h-2 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <p className="text-[11px] text-muted-foreground mt-1.5 mb-0.5">{item.name}</p>
            <strong className="text-sm font-semibold text-foreground">{item.value.toLocaleString()}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};
