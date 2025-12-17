import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// JSX version - Card detail modal with blurred background
export const CardDetailModal = ({ open, onOpenChange, title, children }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border shadow-xl backdrop-blur-sm">
        <div className="space-y-4">
          {title && (
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          )}
          <div className="space-y-3">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Detail item component for breakdown values
export const DetailItem = ({ label, value, subValue }) => (
  <div className="p-4 rounded-lg bg-muted/50 border border-border">
    <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    {subValue && (
      <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
    )}
  </div>
);

