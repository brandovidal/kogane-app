import { Check, ChevronDown, Search } from "lucide-react";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  createComboboxItems,
} from "@/ui/combobox";
import type {
  CatalogOption,
  CatalogSelectProps,
} from "@/shared/types/catalog-select";

const EMPTY = "__none__";

// Catalog selectors share the searchable combobox interaction used by filters.
export function CatalogSelectOptions({
  value,
  onChange,
  placeholder = "Selecciona",
  allowEmpty,
  className,
  disabled,
  options,
  ...triggerProps
}: CatalogSelectProps & { options: CatalogOption[] }) {
  const selectedOption = options.find((option) => option.id === value);
  const items = createComboboxItems(
    allowEmpty ? [{ id: EMPTY, name: "—" }, ...options] : options,
    {
      getValue: (option) => option.id,
      getLabel: (option) => option.name,
    },
  );
  const groups = new Map<string, CatalogOption[]>();
  const ungrouped: CatalogOption[] = [];
  for (const option of options) {
    if (option.group)
      groups.set(option.group, [...(groups.get(option.group) ?? []), option]);
    else ungrouped.push(option);
  }

  return (
    <Combobox
      items={items}
      value={value ?? (allowEmpty ? EMPTY : null)}
      onValueChange={(next) =>
        onChange(next === EMPTY || next == null ? null : String(next))
      }
      itemToStringLabel={(id) =>
        id === EMPTY
          ? "—"
          : (options.find((option) => option.id === id)?.name ?? "")
      }
      autoHighlight
      disabled={disabled}
    >
      <ComboboxTrigger {...triggerProps} className={className}>
        <span className="min-w-0 flex-1 truncate text-left">
          {allowEmpty && value == null
            ? "—"
            : (selectedOption?.content ?? (
                <ComboboxValue placeholder={placeholder} />
              ))}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 opacity-50"
        />
      </ComboboxTrigger>
      <ComboboxContent>
        <div className="border-b p-2">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <ComboboxInput
              aria-label={`Buscar ${placeholder.toLocaleLowerCase()}`}
              placeholder={`Buscar ${placeholder.toLocaleLowerCase()}...`}
              autoComplete="off"
              className="pl-8"
            />
          </div>
        </div>
        <ComboboxList className="max-h-60 p-1">
          {allowEmpty && (
            <ComboboxItem value={EMPTY}>
              —
              <ComboboxItemIndicator>
                <Check className="size-4" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          )}
          {ungrouped.length > 0 && (
            <ComboboxGroup items={ungrouped}>
              <ComboboxCollection>
                {(option: CatalogOption) => (
                  <ComboboxItem key={option.id} value={option.id}>
                    {option.content ?? option.name}
                    <ComboboxItemIndicator>
                      <Check className="size-4" />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
          {[...groups].map(([group, groupOptions], index) => (
            <ComboboxGroup key={group} items={groupOptions}>
              {(index > 0 || ungrouped.length > 0 || allowEmpty) && (
                <ComboboxSeparator className="my-1 h-px bg-border" />
              )}
              <ComboboxGroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {group}
              </ComboboxGroupLabel>
              <ComboboxCollection>
                {(option: CatalogOption) => (
                  <ComboboxItem key={option.id} value={option.id}>
                    {option.content ?? option.name}
                    <ComboboxItemIndicator>
                      <Check className="size-4" />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          ))}
        </ComboboxList>
        <ComboboxEmpty className="px-3 py-6 text-center text-sm text-muted-foreground">
          No se encontraron opciones.
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
