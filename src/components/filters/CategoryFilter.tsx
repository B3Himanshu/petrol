import { Dropdown } from "@/components/common/Dropdown";

interface CategoryFilterProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const CategoryFilter = ({ value = "all", onChange }: CategoryFilterProps) => (
  <div className="min-w-[150px] flex-1">
    <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
    <Dropdown
      defaultValue={value}
      onChange={onChange}
      placeholder="Select category"
      options={[
        { value: "all", label: "All Categories" },
        { value: "fuel", label: "Fuel" },
        { value: "shop", label: "Shop" },
        { value: "services", label: "Services" },
      ]}
    />
  </div>
);


