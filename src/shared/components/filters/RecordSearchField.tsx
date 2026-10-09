import {
  SearchField,
  type SearchFieldProps,
} from "@/shared/components/filters/SearchField";

export type RecordSearchFieldProps = Omit<SearchFieldProps, "placeholder">;

export function RecordSearchField(props: RecordSearchFieldProps) {
  return <SearchField {...props} placeholder="Buscar registros..." />;
}
