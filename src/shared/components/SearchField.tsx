import { Search } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Input } from "@/ui/input";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  className?: string;
  labelClassName?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  className,
  labelClassName = "text-xs font-medium text-muted-foreground",
}: SearchFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <div className={labelClassName}>{label}</div>}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label={label ?? placeholder}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 pl-9"
        />
      </div>
    </div>
  );
}
