import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export const Card = ({ className, header, footer, children }: CardProps) => {
  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-sm", className)}>
      {header && <div className="px-4 py-3 border-b border-border">{header}</div>}
      <div className="p-4">{children}</div>
      {footer && <div className="px-4 py-3 border-t border-border">{footer}</div>}
    </div>
  );
};


