import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import type { CatalogOption, CatalogSelectProps } from "@/shared/types/catalog-select";

const EMPTY = "__none__";

// Any list of { id, name } as a select (e.g. only the cards of a page)
export function CatalogSelectOptions({
  value,
  onChange,
  placeholder = "Selecciona",
  allowEmpty,
  className,
  disabled,
  options,
  ...triggerProps
}: CatalogSelectProps & {
  options: CatalogOption[];
}) {
  const selectedOption = options.find((option) => option.id === value);
  return (
    <Select disabled={disabled} value={value ?? (allowEmpty ? EMPTY : "")} onValueChange={(v) => onChange(v === EMPTY ? null : v)}>
      <SelectTrigger {...triggerProps} className={className}>
        <SelectValue placeholder={placeholder}>
          {selectedOption && (selectedOption.content ?? <span>{selectedOption.name}</span>)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && <SelectItem value={EMPTY}>—</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.content ?? <span>{option.name}</span>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

