import { cn } from "@/lib/utils";

const mockData = [
  { site: "Site A", sales: 95000, profit: 12500 },
  { site: "Site B", sales: 87000, profit: 11200 },
  { site: "Site C", sales: 82000, profit: 9800 },
  { site: "Site D", sales: 78000, profit: 9200 },
  { site: "Site E", sales: 72000, profit: 8500 },
];

export const MarketingInitiativesTable = () => {
  return (
    <div className="chart-card animate-slide-up" style={{ animationDelay: "550ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        New Marketing Initiatives
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Site</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Sales</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Profit</th>
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
                <td className="py-3 px-4 text-right text-foreground">
                  £{row.profit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

