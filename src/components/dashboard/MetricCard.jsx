import { cn } from "@/lib/utils";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer } from "recharts";

const iconBgColors = {
  blue: "bg-metric-blue/10 text-metric-blue",
  green: "bg-metric-green/10 text-metric-green",
  yellow: "bg-metric-yellow/10 text-metric-yellow",
  orange: "bg-metric-orange/10 text-metric-orange",
  purple: "bg-metric-purple/10 text-metric-purple",
  pink: "bg-metric-pink/10 text-metric-pink",
};

const chartColors = {
  blue: "#3b82f6",
  green: "#10b981",
  yellow: "#f59e0b",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

// Pure JSX version (no TypeScript types)
export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  change, 
  changeType = "neutral",
  icon: Icon,
  iconBg,
  sparkline,
  delay = 0,
  chartType = "none",
  chartData = []
}) => {
  // Transform chartData for recharts
  const formattedChartData = chartData.map((value, index) => ({
    name: index,
    value: value
  }));

  return (
    <div 
      className="relative bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header with Icon and Title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
            iconBgColors[iconBg]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
          </div>
        </div>
      </div>

      {/* Value */}
      <div className="mb-3">
        <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>
        )}
        {change && (
          <p className={cn(
            "text-xs font-semibold mt-2 inline-flex items-center gap-1",
            changeType === "positive" && "text-metric-green",
            changeType === "negative" && "text-destructive",
            changeType === "neutral" && "text-muted-foreground"
          )}>
            {changeType === "positive" && "↗"}
            {changeType === "negative" && "↘"}
            {change}
          </p>
        )}
      </div>

      {/* Enhanced Mini Charts */}
      {chartType !== "none" && chartData.length > 0 && (
        <div className="h-20 mt-4 -mb-2 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={formattedChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id={`gradient-${iconBg}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors[iconBg]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors[iconBg]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chartColors[iconBg]} 
                  strokeWidth={2.5}
                  dot={false}
                  fill={`url(#gradient-${iconBg})`}
                />
              </LineChart>
            ) : (
              <BarChart data={formattedChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Bar 
                  dataKey="value" 
                  fill={chartColors[iconBg]}
                  radius={[6, 6, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Legacy Sparkline - Enhanced */}
      {sparkline && !chartData.length && (
        <div className="h-12 flex items-end gap-1.5 mt-4">
          {sparkline.map((value, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-md transition-all hover:opacity-80"
              style={{ 
                height: `${(value / Math.max(...sparkline)) * 100}%`,
                backgroundColor: chartColors[iconBg],
                opacity: 0.7
              }}
            />
          ))}
        </div>
      )}

      {/* Decorative gradient overlay */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{ backgroundColor: chartColors[iconBg] }}
      />
    </div>
  );
};
