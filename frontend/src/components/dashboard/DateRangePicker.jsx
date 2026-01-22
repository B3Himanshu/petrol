import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

const normalizeDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const DateRangePicker = ({ startDate, endDate, onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(() => ({
    from: normalizeDate(startDate),
    to: normalizeDate(endDate),
  }));

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

  const handleSelect = (range) => {
    if (!range) {
      setTempDate({ from: null, to: null });
      return;
    }
    setTempDate({
      from: range.from ?? null,
      to: range.to ?? null,
    });
  };

  const handleConfirm = () => {
    if (tempDate?.from && tempDate?.to) {
      onDateChange(format(tempDate.from, 'yyyy-MM-dd'), format(tempDate.to, 'yyyy-MM-dd'));
    }
    setIsOpen(false);
  };

  const displayText = tempDate?.from && tempDate?.to 
    ? `${format(tempDate.from, 'MMM d')} - ${format(tempDate.to, 'MMM d')}`
    : "Select date";

  const monthForHeader = tempDate?.from || tempDate?.to || new Date();

  return (
    <div className="w-full">
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) {
            setTempDate({ from: normalizeDate(startDate), to: normalizeDate(endDate) });
          }
        }}
      >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-10 border border-slate-800 bg-slate-900 text-slate-100 hover:border-slate-600 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-slate-200" />
                <span className="text-sm font-medium">{displayText}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-auto p-0 bg-slate-950 border border-slate-800 shadow-2xl rounded-2xl"
            align="start"
          >
            <div className="bg-slate-950 rounded-2xl overflow-hidden">
              {/* Header with presets */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70">
                <span className="text-sm font-semibold text-slate-100">
                  {format(monthForHeader, 'MMMM yyyy')}
                </span>
                <div className="flex gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setTempDate(preset.getValue())}
                      className="px-3 py-1 text-xs font-medium rounded-full border border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-500 hover:text-white transition-colors"
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
                      --rdp-cell-size: 38px;
                      --rdp-accent-color: #0f172a;
                      --rdp-background-color: rgba(15, 23, 42, 0.28);
                      margin: 0;
                    }
                    .rdp-months {
                      justify-content: center;
                    }
                    .rdp-month {
                      width: 100%;
                    }
                    .rdp-head_cell {
                      color: #94a3b8;
                      font-weight: 600;
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
                      border-radius: 10px;
                      color: #e2e8f0;
                      transition: all 0.15s;
                    }
                    .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) {
                      background-color: #111827;
                      color: #f8fafc;
                    }
                    .rdp-day_selected {
                      background-color: #0f172a !important;
                      color: #f8fafc !important;
                      font-weight: 700;
                      box-shadow: 0 8px 16px rgba(0,0,0,0.35);
                    }
                    .rdp-day_range_start,
                    .rdp-day_range_end {
                      background-color: #0f172a !important;
                      color: #f8fafc !important;
                    }
                    .rdp-day_range_middle {
                      background-color: rgba(15, 23, 42, 0.35) !important;
                      color: #e2e8f0 !important;
                    }
                    .rdp-day_disabled {
                      color: #475569;
                      opacity: 0.6;
                    }
                    .rdp-day_today:not(.rdp-day_selected) {
                      font-weight: 700;
                      color: #e2e8f0;
                      border: 1px solid #1f2937;
                    }
                  `}
                </style>
                <Calendar
                  mode="range"
                  selected={tempDate?.from || tempDate?.to ? tempDate : undefined}
                  onSelect={handleSelect}
                  numberOfMonths={1}
                  disabled={(date) => date > new Date()}
                  className="bg-slate-950"
                />
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {tempDate?.from && tempDate?.to && (
                    <span>
                      {format(tempDate.from, 'MMM d, yyyy')} - {format(tempDate.to, 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleConfirm}
                  disabled={!tempDate?.from || !tempDate?.to}
                  className="h-9 px-5 bg-black hover:bg-slate-900 text-white font-semibold text-sm rounded-xl shadow-md disabled:opacity-60 disabled:bg-slate-800 disabled:text-slate-500"
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