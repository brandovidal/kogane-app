import { Palette, Plus, RotateCcw, X } from "lucide-react";
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/ui/dropdown-menu";
import { Button } from "@/ui/button";
import {
  MAX_WITHIN_DAYS,
  ROW_COLORS,
  ROW_COLOR_LABELS,
  type RowColor,
  type RowColorRule,
} from "@/shared/lib/row-color-rules";

const selectClass =
  "h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring";

export interface RowColorRulesMenuProps {
  rules: RowColorRule[];
  onChange: (rules: RowColorRule[]) => void;
  onReset: () => void;
}

/** "Color condicional" submenu of the view settings: color a row by how close its due date is. */
export function RowColorRulesMenu({
  rules,
  onChange,
  onReset,
}: RowColorRulesMenuProps) {
  const patch = (id: string, next: Partial<RowColorRule>) =>
    onChange(
      rules.map((rule) => (rule.id === id ? { ...rule, ...next } : rule)),
    );
  const addRule = () =>
    onChange([
      ...rules,
      {
        id: crypto.randomUUID(),
        when: { type: "within", days: 7 },
        skipFinished: true,
        color: "blue",
      },
    ]);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="rounded-md py-2">
        <Palette className="size-4" /> Color condicional
        <span className="ml-auto text-xs text-muted-foreground">
          {rules.length ? `${rules.length}` : "Sin reglas"}
        </span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        className="w-80 rounded-xl border-border/80 bg-popover p-1.5 shadow-xl"
        // Typing in the fields must not trigger the menu's own type-ahead
        onKeyDown={(event) => event.stopPropagation()}
      >
        <DropdownMenuLabel className="px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          Colorear la fila cuando
        </DropdownMenuLabel>
        {rules.length === 0 && (
          <p className="px-2.5 py-2 text-xs text-muted-foreground">
            Aún no hay reglas. Añade una para resaltar lo que vence pronto.
          </p>
        )}
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="space-y-1.5 rounded-md px-2 py-1.5 hover:bg-accent/40"
          >
            <div className="flex items-center gap-1.5">
              <select
                aria-label="Condición"
                className={`${selectClass} flex-1`}
                value={rule.when.type}
                onChange={(event) =>
                  patch(rule.id, {
                    when:
                      event.target.value === "overdue"
                        ? { type: "overdue" }
                        : { type: "within", days: 3 },
                  })
                }
              >
                <option value="within">Vence en…</option>
                <option value="overdue">Vencido</option>
              </select>
              {rule.when.type === "within" && (
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  ≤
                  <input
                    aria-label="Días"
                    type="number"
                    min={0}
                    max={MAX_WITHIN_DAYS}
                    className={`${selectClass} w-14`}
                    value={rule.when.days}
                    onChange={(event) => {
                      const days = Math.min(
                        MAX_WITHIN_DAYS,
                        Math.max(0, Math.trunc(Number(event.target.value))),
                      );
                      if (Number.isFinite(days))
                        patch(rule.id, { when: { type: "within", days } });
                    }}
                  />
                  días
                </label>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label="Quitar regla"
                onClick={() => onChange(rules.filter((r) => r.id !== rule.id))}
              >
                <X className="size-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={rule.skipFinished}
                  onChange={(event) =>
                    patch(rule.id, { skipFinished: event.target.checked })
                  }
                />
                y Estado ≠ Pagado
              </label>
              <select
                aria-label="Color"
                className={`${selectClass} ml-auto`}
                value={rule.color}
                onChange={(event) =>
                  patch(rule.id, { color: event.target.value as RowColor })
                }
              >
                {ROW_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {ROW_COLOR_LABELS[color]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-1">
          <Button type="button" variant="ghost" size="sm" onClick={addRule}>
            <Plus className="mr-1 size-3.5" /> Añadir regla
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="mr-1 size-3.5" /> Restablecer
          </Button>
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
