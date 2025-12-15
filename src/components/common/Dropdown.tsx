import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactNode } from "react";

interface Option {
  value: string;
  label: ReactNode;
}

interface DropdownProps {
  placeholder?: string;
  options: Option[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export const Dropdown = ({ placeholder, options, defaultValue, onChange }: DropdownProps) => {
  return (
    <Select defaultValue={defaultValue} onValueChange={onChange}>
      <SelectTrigger className="bg-background border-border">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};


