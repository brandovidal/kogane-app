import {
  CURRENCY_OPTIONS,
  type CurrencyCode,
} from "@/shared/constants/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

export function CurrencySelect({
  value,
  onChange,
}: {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next === "PEN" || next === "USD") onChange(next);
      }}
    >
      <SelectTrigger size="sm" aria-label="Moneda del estado de cuenta">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
