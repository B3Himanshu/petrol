import { useState, useEffect, memo } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardAPI } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PetrolSitesNeedingImprovementTableComponent = ({ startDate, endDate }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) {
      setTableData([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('📊 [PetrolSitesNeedingImprovementTable] Fetching data:', { startDate, endDate });
        
        const response = await dashboardAPI.getPetrolSiteRankings(startDate, endDate);
        
        console.log('📊 [PetrolSitesNeedingImprovementTable] Received data:', response);
        
        setTableData(response?.bottom || []);
      } catch (error) {
        console.error('❌ [PetrolSitesNeedingImprovementTable] Error fetching data:', error);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "£0";
    if (amount >= 1000000) return `£${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `£${(amount / 1000).toFixed(1)}k`;
    return `£${amount.toFixed(0)}`;
  };

  // Get rank badge (simple number for bottom sites)
  const getRankBadge = (rank) => {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 text-destructive font-bold text-sm border border-destructive/20">
        {rank}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="chart-card animate-slide-up">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading data...</div>
        </div>
      </div>
    );
  }

  if (!tableData || tableData.length === 0) {
    return (
      <div className="chart-card animate-slide-up">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Sites Needing Improvement
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-semibold text-foreground">
          Sites Needing Improvement
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead className="min-w-[150px]">Site Name</TableHead>
              <TableHead className="text-right min-w-[100px]">Net Sales</TableHead>
              <TableHead className="text-right min-w-[80px]">PPL</TableHead>
              <TableHead className="text-right min-w-[80px]">Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow
                key={index}
                className={cn(
                  "hover:bg-destructive/5 transition-colors",
                  index % 2 === 0 ? 'bg-destructive/5' : ''
                )}
              >
                <TableCell className="text-center">
                  {getRankBadge(index + 1)}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {row.name}
                </TableCell>
                <TableCell className="text-right font-semibold text-destructive/80">
                  {formatCurrency(row.net_sales || 0)}
                </TableCell>
                <TableCell className="text-right font-semibold text-destructive/80">
                  {row.ppl?.toFixed(2) || '0.00'} p
                </TableCell>
                <TableCell className="text-right font-semibold text-destructive/80">
                  {row.margin?.toFixed(1) || '0.0'}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export const PetrolSitesNeedingImprovementTable = memo(PetrolSitesNeedingImprovementTableComponent);
