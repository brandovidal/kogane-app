import type { ReactNode } from "react";
import {
  CalendarPlus,
  InboxIcon,
  ListFilter,
  Plus,
  SearchX,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type EmptyStateVariant = "empty" | "period" | "filters" | "search";

const VARIANT_ICON: Record<EmptyStateVariant, LucideIcon> = {
  empty: InboxIcon,
  period: CalendarPlus,
  filters: ListFilter,
  search: SearchX,
};

const VARIANT_BADGE: Partial<Record<EmptyStateVariant, LucideIcon>> = {
  period: Plus,
  filters: X,
};

export interface EmptyStateProps {
  title?: string;
  description?: string;
  /** Mensaje corto sin icono, como en "Búsqueda sin resultados". */
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  /** `success`: recuadro verde, para "todo al día". */
  tone?: "default" | "success";
  /** Contenido entre la descripción y las acciones (chips, listas). */
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Sin datos",
  description = "No hay registros para mostrar",
  variant = "empty",
  icon,
  tone = "default",
  children,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icon ?? VARIANT_ICON[variant];
  const Badge = VARIANT_BADGE[variant];

  return (
    <section
      aria-label={title}
      data-variant={variant}
      className={cn(
        "flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card/40 px-5 py-10 text-center sm:px-8",
        className,
      )}
    >
      {variant !== "search" && (
        <span
          className={cn(
            "relative flex size-14 items-center justify-center rounded-2xl",
            tone === "success"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
              : "bg-muted/60 text-muted-foreground",
          )}
        >
          <Icon aria-hidden="true" className="size-6" />
          {Badge && (
            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border bg-background">
              <Badge aria-hidden="true" className="size-3" />
            </span>
          )}
        </span>
      )}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mx-auto max-w-lg text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
      {action && (
        <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>
      )}
    </section>
  );
}
