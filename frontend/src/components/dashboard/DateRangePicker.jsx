import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * DateRangePicker Component
 * Allows users to select a date range for filtering data
 */
export const DateRangePicker = ({ startDate, endDate, onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Convert string dates to Date objects for the calendar
  // Use parseISO to avoid timezone issues
  const startDateObj = useMemo(() => {
    if (!startDate) return null;
    try {
      const date = parseISO(startDate);
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  }, [startDate]);

  const endDateObj = useMemo(() => {
    if (!endDate) return null;
    try {
      const date = parseISO(endDate);
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  }, [endDate]);

  // Handle date selection from calendar
  const handleDateSelect = (range) => {
    console.log('📅 [DateRangePicker] Date selection:', range);
    
    if (!range) {
      // User cleared selection
      return;
    }

    if (range.from) {
      if (range.to) {
        // Both dates selected - complete range
        const fromDate = format(range.from, 'yyyy-MM-dd');
        const toDate = format(range.to, 'yyyy-MM-dd');
        console.log('📅 [DateRangePicker] Complete range selected:', { fromDate, toDate });
        onDateChange(fromDate, toDate);
        setIsOpen(false);
      } else {
        // Only start date selected - wait for end date
        // Update start date immediately but keep calendar open
        const fromDate = format(range.from, 'yyyy-MM-dd');
        // Keep current endDate or use startDate as endDate if none exists
        const currentEndDate = endDate || fromDate;
        console.log('📅 [DateRangePicker] Start date selected:', { fromDate, currentEndDate });
        onDateChange(fromDate, currentEndDate);
      }
    }
  };

  // Format display text
  const displayText = () => {
    if (startDate && endDate) {
      try {
        const start = format(parseISO(startDate), 'MMM dd, yyyy');
        const end = format(parseISO(endDate), 'MMM dd, yyyy');
        return `${start} - ${end}`;
      } catch (error) {
        console.error('Error formatting dates:', error);
        return `${startDate} - ${endDate}`;
      }
    }
    return "Pick a date range";
  };

  // Create selected range object for calendar
  const selectedRange = useMemo(() => {
    if (startDateObj && endDateObj) {
      return {
        from: startDateObj,
        to: endDateObj
      };
    }
    if (startDateObj) {
      return {
        from: startDateObj,
        to: undefined
      };
    }
    return undefined;
  }, [startDateObj, endDateObj]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-9 sm:h-10",
            "border-border bg-background hover:bg-accent hover:text-accent-foreground",
            "transition-colors shadow-sm text-xs sm:text-sm",
            !startDate && !endDate && "text-muted-foreground"
          )}
        >
          <CalendarDays className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
          <span className="font-medium truncate">{displayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border-border shadow-lg mx-2 sm:mx-0 max-w-[calc(100vw-1rem)] sm:max-w-none" 
        align="start"
        sideOffset={4}
        side="bottom"
        alignOffset={0}
      >
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Calendar
            mode="range"
            defaultMonth={startDateObj || endDateObj || new Date()}
            selected={selectedRange}
            onSelect={handleDateSelect}
            numberOfMonths={1}
            disabled={(date) => {
              const today = new Date();
              today.setHours(23, 59, 59, 999);
              return date > today;
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
