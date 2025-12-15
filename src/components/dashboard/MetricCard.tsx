import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBg: "blue" | "green" | "yellow" | "orange" | "purple" | "pink";
  sparkline?: number[];
  delay?: number;
}

const iconBgColors = {
  blue: "bg-metric-blue/10 text-metric-blue",
  green: "bg-metric-green/10 text-metric-green",
  yellow: "bg-metric-yellow/10 text-metric-yellow",
  orange: "bg-metric-orange/10 text-metric-orange",
  purple: "bg-metric-purple/10 text-metric-purple",
  pink: "bg-metric-pink/10 text-metric-pink",
};

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  change, 
  changeType = "neutral",
  icon: Icon,
  iconBg,
  sparkline,
  delay = 0
}: MetricCardProps) => {
  return (
    <div 
      className="metric-card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {change && (
            <p className={cn(
              "text-xs font-medium mt-2",
              changeType === "positive" && "text-metric-green",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </p>
          )}
        </div>
        
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconBgColors[iconBg]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Sparkline */}
      {sparkline && (
        <div className="h-10 flex items-end gap-1">
          {sparkline.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-muted rounded-t transition-all hover:bg-primary/30"
              style={{ height: `${(value / Math.max(...sparkline)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
