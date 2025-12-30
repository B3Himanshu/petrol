import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// JSX version - Card detail modal with blurred background
export const CardDetailModal = ({ open, onOpenChange, title, children }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto bg-card border-border shadow-xl backdrop-blur-sm">
        <div className="space-y-3">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          <div className="space-y-2">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Detail item component for breakdown values
export const DetailItem = ({ label, value, subValue }) => (
  <div className="p-3 rounded-lg bg-muted/50 border border-border">
    <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
    <p className="text-xl font-bold text-foreground">{value}</p>
    {subValue && (
      <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
    )}
  </div>
);

