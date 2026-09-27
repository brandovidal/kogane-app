import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useCategories, usePaymentMethods, usePeople } from "@/shared/api/hooks/catalogs";
import { CategoryLabel } from "@/shared/components/CategoryIcon";

// Selects fed by the catalogs of kogane-api (D62): the value is always the id
interface CatalogSelectProps {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  placeholder?: string;
  allowEmpty?: boolean; // adds "—" to clear an optional field
  className?: string;
  disabled?: boolean;
}

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
}: CatalogSelectProps & {
  options: { id: string; name: string; icon?: string | null; color?: string | null }[];
}) {
  const selectedOption = options.find((option) => option.id === value);
  return (
    <Select disabled={disabled} value={value ?? (allowEmpty ? EMPTY : "")} onValueChange={(v) => onChange(v === EMPTY ? null : v)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {selectedOption && <CatalogOption option={selectedOption} />}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && <SelectItem value={EMPTY}>—</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            <CatalogOption option={option} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PersonSelect(props: CatalogSelectProps) {
  const people = usePeople().data?.filter((person) => person.isActive) ?? [];
  return <CatalogSelectOptions {...props} options={people} />;
}

// `type: "credit_card"` limits it to cards (Tarjetas)
export function PaymentMethodSelect({ type, ...props }: CatalogSelectProps & { type?: string }) {
  const methods = usePaymentMethods().data?.filter((method) => method.isActive && (!type || method.type === type)) ?? [];
  return <CatalogSelectOptions {...props} options={methods} />;
}

export function CategorySelect(props: CatalogSelectProps) {
  const categories = useCategories().data ?? [];
  return <CatalogSelectOptions {...props} options={categories} />;
}

function CatalogOption({ option }: { option: { name: string; icon?: string | null; color?: string | null } }) {
  return option.icon || option.color ? (
    <CategoryLabel name={option.name} icon={option.icon} color={option.color} />
  ) : (
    <span>{option.name}</span>
  );
}
