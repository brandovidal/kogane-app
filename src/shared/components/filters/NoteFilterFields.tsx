import { FileText } from "lucide-react";
import {
  ShortFilterFields,
  type ShortFilterFieldsProps,
} from "./ShortFilterFields";

type Props = Omit<ShortFilterFieldsProps, "options" | "mode" | "allLabel"> & {
  allLabel?: string;
};

const options = [
  { value: "yes", label: "Con nota" },
  { value: "no", label: "Sin nota" },
];

export function NoteFilterFields({
  allLabel = "Todas",
  icon = FileText,
  ...props
}: Props) {
  return (
    <ShortFilterFields
      {...props}
      icon={icon}
      options={options}
      mode="single"
      allLabel={allLabel}
    />
  );
}
