import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const mockData = [
  { site: "Site 1", sales: 210000, avgPPL: 6.5 },
  { site: "Site 2", sales: 180000, avgPPL: 6.2 },
  { site: "Site 3", sales: 165000, avgPPL: 6.0 },
  { site: "Site 4", sales: 150000, avgPPL: 5.8 },
  { site: "Site 5", sales: 135000, avgPPL: 5.5 },
];

export const TopPerformingSitesTable = () => {
  const maxSales = Math.max(...mockData.map((d) => d.sales));

  return (
    <div className="chart-card animate-slide-up" style={{ animationDelay: "500ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Top Performing Sites
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Site</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Sales</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Avg. PPL</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Progress</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((row, index) => (
              <tr
                key={index}
                className="border-b border-border/60 hover:bg-muted/40 transition-colors"
              >
                <td className="py-3 px-4 text-foreground font-medium">{row.site}</td>
                <td className="py-3 px-4 text-right text-foreground">
                  £{row.sales.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-foreground">{row.avgPPL.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(row.sales / maxSales) * 100}
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                      {Math.round((row.sales / maxSales) * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

