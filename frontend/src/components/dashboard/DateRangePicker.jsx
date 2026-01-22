import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export const DateRangePicker = ({ startDate, endDate, onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState({
    from: startDate ? new Date(startDate) : null,
    to: endDate ? new Date(endDate) : null
  });

  const presets = [
    { label: "Last month", getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }},
    { label: "This month", getValue: () => {
      const now = new Date();
      return { from: startOfMonth(now), to: now };
    }},
  ];

  const handleConfirm = () => {
    if (tempDate.from && tempDate.to) {
      onDateChange(format(tempDate.from, 'yyyy-MM-dd'), format(tempDate.to, 'yyyy-MM-dd'));
    }
    setIsOpen(false);
  };

  const displayText = tempDate.from && tempDate.to 
    ? `${format(tempDate.from, 'MMM d')} - ${format(tempDate.to, 'MMM d')}`
    : "Select date";

  return (
    <div className="w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-zinc-950 border-zinc-800 text-zinc-100 hover:bg-zinc-900 hover:border-zinc-700"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-medium">{displayText}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-auto p-0 bg-zinc-950 border-zinc-800 shadow-2xl"
            align="start"
          >
            <div className="bg-zinc-950">
              {/* Header with presets */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <span className="text-sm font-semibold text-zinc-100">
                  {format(tempDate.from || new Date(), 'MMMM yyyy')}
                </span>
                <div className="flex gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setTempDate(preset.getValue())}
                      className="px-3 py-1 text-xs font-medium rounded-md bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              <div className="p-3">
                <style>
                  {`
                    .rdp {
                      --rdp-cell-size: 36px;
                      --rdp-accent-color: #10b981;
                      --rdp-background-color: rgba(16, 185, 129, 0.15);
                      margin: 0;
                    }
                    .rdp-months {
                      justify-content: center;
                    }
                    .rdp-month {
                      width: 100%;
                    }
                    .rdp-caption {
                      display: none;
                    }
                    .rdp-head_cell {
                      color: #71717a;
                      font-weight: 500;
                      font-size: 11px;
                      text-transform: uppercase;
                      padding: 0;
                      height: 28px;
                    }
                    .rdp-cell {
                      padding: 2px;
                    }
                    .rdp-day {
                      width: 36px;
                      height: 36px;
                      font-size: 13px;
                      font-weight: 500;
                      border-radius: 6px;
                      color: #d4d4d8;
                      transition: all 0.15s;
                    }
                    .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) {
                      background-color: #27272a;
                      color: #fafafa;
                    }
                    .rdp-day_selected {
                      background-color: #10b981 !important;
                      color: #000000 !important;
                      font-weight: 600;
                    }
                    .rdp-day_range_start,
                    .rdp-day_range_end {
                      background-color: #10b981 !important;
                      color: #000000 !important;
                    }
                    .rdp-day_range_middle {
                      background-color: rgba(16, 185, 129, 0.15) !important;
                      color: #10b981 !important;
                    }
                    .rdp-day_disabled {
                      color: #3f3f46;
                      opacity: 0.4;
                    }
                    .rdp-day_today:not(.rdp-day_selected) {
                      font-weight: 600;
                      color: #10b981;
                    }
                  `}
                </style>
                <Calendar
                  mode="range"
                  selected={tempDate}
                  onSelect={setTempDate}
                  numberOfMonths={1}
                  disabled={(date) => date > new Date()}
                  className="bg-zinc-950"
                />
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
                <div className="text-xs text-zinc-400">
                  {tempDate.from && tempDate.to && (
                    <span>
                      {format(tempDate.from, 'MMM d, yyyy')} - {format(tempDate.to, 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleConfirm}
                  disabled={!tempDate.from || !tempDate.to}
                  className="h-8 px-4 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm rounded-lg disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
    </div>
  );
}