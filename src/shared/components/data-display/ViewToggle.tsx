import { LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/ui/button";

export interface ViewToggleProps {
  view?: "table" | "cards";
  value?: "table" | "cards";
  onChange: (view: "table" | "cards") => void;
}

export function ViewToggle({
  view: viewProp,
  value,
  onChange,
}: ViewToggleProps) {
  const view = value ?? viewProp ?? "table";
  const option = (
    mode: "table" | "cards",
    label: string,
    Icon: typeof Table2,
  ) => (
    <Button
      type="button"
      variant={view === mode ? "secondary" : "ghost"}
      size="sm"
      className="h-7 px-2"
      aria-pressed={view === mode}
      aria-label={label}
      title={label}
      onClick={() => onChange(mode)}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      {option("table", "Tabla", Table2)}
      {option("cards", "Tarjetas", LayoutGrid)}
    </div>
  );
}
