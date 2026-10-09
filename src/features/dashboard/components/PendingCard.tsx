import { useState } from "react";
import { Bell, ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDayMonth, getMonthName } from "@/shared/lib/dates";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import {
  dueLabel,
  filterPending,
  groupByPerson,
  groupSection,
  isLate,
  limitList,
  pendingCounts,
  pluralize,
  sortByUrgency,
  summarizeSection,
  type PendingEntry,
  type PendingFilter,
  type PendingGroup,
} from "@/features/dashboard/lib/pending-groups";

export type PaymentTab = "card" | "fixed" | "collect" | "debt";

interface PendingCardProps {
  entries: PendingEntry[];
  today: Date;
  month: number;
  year: number;
  /** Billed (closed) month: "Por cerrar de …" instead of "Pendientes del mes". */
  isBilled: boolean;
  /** Month right before the selected one, to offer it in the empty state. */
  onGoToPreviousMonth: () => void;
  onRegisterPayment: (tab: PaymentTab) => void;
}

const money = (value: number | null, sign: "-" | "+" | "") =>
  value == null ? "—" : `${sign ? `${sign} ` : ""}${formatCurrency(value)}`;

function tabOf(entry: PendingEntry): PaymentTab {
  if (entry.kind === "card") return "card";
  if (entry.kind === "debt") return "debt";
  if (entry.kind === "collect") return "collect";
  return "fixed";
}

function EntryRow({
  entry,
  today,
  onRegisterPayment,
}: {
  entry: PendingEntry;
  today: Date;
  onRegisterPayment: (tab: PaymentTab) => void;
}) {
  const label = entry.paid ? null : dueLabel(entry.dueDate, today);
  const late = isLate(entry, today);
  const sign = entry.kind === "collect" ? "+" : entry.amount == null ? "" : "-";
  return (
    <div className="flex flex-wrap items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{entry.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {entry.detail}
          {entry.dueDate && !entry.paid
            ? ` · vence ${formatDayMonth(entry.dueDate)}`
            : ""}
          {label ? (
            <span className={late ? " text-destructive" : undefined}>
              {" "}
              · {label}
            </span>
          ) : null}
        </p>
      </div>
      <span className="min-w-24 text-right text-sm font-semibold tabular-nums">
        {money(entry.amount, entry.paid ? "" : sign)}
      </span>
      {entry.kind === "review" || entry.paid ? (
        <Button asChild variant="outline" size="sm" className="min-w-20">
          <a href={entry.href}>{entry.action}</a>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="min-w-20"
          onClick={() => onRegisterPayment(tabOf(entry))}
        >
          {entry.action}
        </Button>
      )}
    </div>
  );
}

function GroupHeader({
  open,
  onToggle,
  title,
  subtitle,
  total,
  sign,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  subtitle: React.ReactNode;
  total: string;
  sign?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        </span>
      </button>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          sign === "+" && "text-emerald-400",
        )}
      >
        {total}
      </span>
      {children}
    </div>
  );
}

function PayGroup({
  group,
  today,
  onRegisterPayment,
}: {
  group: PendingGroup;
  today: Date;
  onRegisterPayment: (tab: PaymentTab) => void;
}) {
  const [open, setOpen] = useState(false);
  const next = dueLabel(group.nextDueDate, today);
  const subtitle = [
    pluralize(group.items.length, "elemento", "elementos"),
    group.late ? pluralize(group.late, "retrasado", "retrasados") : null,
    !group.late && next ? next : null,
    group.late && group.soon
      ? `${group.soon} ${group.soon === 1 ? "vence" : "vencen"} pronto`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <div>
      <GroupHeader
        open={open}
        onToggle={() => setOpen((value) => !value)}
        title={group.label}
        subtitle={subtitle}
        total={money(group.total, "-")}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRegisterPayment(tabOf(group.items[0]))}
        >
          Registrar pago
        </Button>
      </GroupHeader>
      {open && (
        <div className="ml-6 divide-y border-l pl-3">
          {group.items.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              today={today}
              onRegisterPayment={onRegisterPayment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectGroups({
  entries,
  today,
  onRegisterPayment,
}: {
  entries: PendingEntry[];
  today: Date;
  onRegisterPayment: (tab: PaymentTab) => void;
}) {
  const [open, setOpen] = useState(false);
  const people = groupByPerson(entries, today);
  const summary = summarizeSection(entries, "collect");
  const late = people.reduce((count, person) => count + person.late, 0);
  return (
    <div>
      <GroupHeader
        open={open}
        onToggle={() => setOpen((value) => !value)}
        title="Cobros"
        subtitle={[
          `${pluralize(summary.count, "elemento", "elementos")} · ${pluralize(summary.people, "persona", "personas")}`,
          late ? pluralize(late, "retrasado", "retrasados") : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        total={money(summary.total, "+")}
        sign="+"
      >
        <Button asChild variant="outline" size="sm">
          <a href="/resumen-deudas">Ver resumen</a>
        </Button>
      </GroupHeader>
      {open && (
        <div className="ml-6 divide-y border-l pl-3">
          {people.map((person) => (
            <div key={person.person} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{person.person}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {pluralize(person.items.length, "cobro", "cobros")}
                  {person.late
                    ? ` · ${pluralize(person.late, "retrasado", "retrasados")}`
                    : ""}
                  {person.oldestDueDate
                    ? ` · el más antiguo ${formatDayMonth(person.oldestDueDate)}`
                    : ""}
                </p>
              </div>
              <span className="min-w-24 text-right text-sm font-semibold tabular-nums">
                {money(person.total, "")}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="min-w-20"
                onClick={() => onRegisterPayment("collect")}
              >
                Cobrar
              </Button>
            </div>
          ))}
          <p className="py-2.5 text-xs text-muted-foreground">
            Abre el Resumen para editar y cambiar el estado por persona
          </p>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="eyebrow text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <div className="divide-y">{children}</div>
    </section>
  );
}

export function PendingCard({
  entries,
  today,
  month,
  year,
  isBilled,
  onGoToPreviousMonth,
  onRegisterPayment,
}: PendingCardProps) {
  const [filter, setFilter] = useState<PendingFilter>("all");
  const [showAll, setShowAll] = useState(false);
  const counts = pendingCounts(entries, today);
  const monthName = getMonthName(month).toLowerCase();
  const previousName = getMonthName(month === 1 ? 12 : month - 1);

  const filtered = sortByUrgency(filterPending(entries, filter, today), today);
  const { shown, hidden } = limitList(filtered, showAll);
  const pay = summarizeSection(entries, "pay");
  const collect = summarizeSection(entries, "collect");
  const review = summarizeSection(entries, "review");

  const tabs: Array<[PendingFilter, string, number]> = [
    ["all", "Todos", counts.all],
    ["soon", "Vencen pronto", counts.soon],
    ["late", "Retrasados", counts.late],
  ];
  const paidEntries = entries.filter((entry) => entry.paid);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {isBilled ? `Por cerrar de ${monthName}` : "Pendientes del mes"}
          <Badge variant="secondary">{counts.all}</Badge>
          <span className="rounded-full border px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
            Solo {monthName}
          </span>
        </CardTitle>
        <div
          className="flex rounded-lg border bg-muted/50 p-0.5"
          role="tablist"
        >
          {tabs.map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              onClick={() => {
                setFilter(value);
                setShowAll(false);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                filter === value && "bg-background text-foreground shadow-sm",
              )}
            >
              {label}
              <span className="tabular-nums">{count}</span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {counts.all === 0 && paidEntries.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-1 text-center">
            <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <Bell className="size-5" />
            </span>
            <p className="text-sm font-medium">Todo al día en {monthName}</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              No tienes pagos, cobros ni borradores pendientes. Los nuevos
              movimientos aparecerán aquí.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={onGoToPreviousMonth}>
                Ver {previousName.toLowerCase()} (facturado)
              </Button>
              <Button size="sm" onClick={() => onRegisterPayment("card")}>
                Registrar pago
              </Button>
            </div>
          </div>
        ) : filter === "all" ? (
          <>
            {pay.count > 0 && (
              <Section
                title="Por pagar"
                hint={`${money(pay.total, "-")} · ${pluralize(pay.groups, "grupo", "grupos")} · ${pluralize(pay.count, "elemento", "elementos")}`}
              >
                {groupSection(entries, "pay", today).map((group) => (
                  <PayGroup
                    key={group.kind}
                    group={group}
                    today={today}
                    onRegisterPayment={onRegisterPayment}
                  />
                ))}
              </Section>
            )}
            {collect.count > 0 && (
              <Section
                title="Por cobrar"
                hint={`${money(collect.total, "+")} · ${pluralize(collect.count, "cobro", "cobros")} · ${pluralize(collect.people, "persona", "personas")}`}
              >
                <CollectGroups
                  entries={entries}
                  today={today}
                  onRegisterPayment={onRegisterPayment}
                />
              </Section>
            )}
            {review.count > 0 && (
              <Section title="Por revisar" hint="Sin monto">
                {entries
                  .filter((entry) => !entry.paid && entry.kind === "review")
                  .map((entry) => (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      today={today}
                      onRegisterPayment={onRegisterPayment}
                    />
                  ))}
              </Section>
            )}
            {paidEntries.length > 0 && (
              <Section title="Pagado" hint="Mes facturado">
                {paidEntries.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    today={today}
                    onRegisterPayment={onRegisterPayment}
                  />
                ))}
              </Section>
            )}
          </>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {filter === "soon"
              ? "No hay vencimientos próximos"
              : "No tienes pagos retrasados"}
          </p>
        ) : (
          <div>
            {filtered.length > shown.length || filtered.length > 6 ? (
              <p className="pb-1 text-xs text-muted-foreground">
                {showAll
                  ? `Mostrando los ${filtered.length}`
                  : `Mostrando los ${shown.length} más ${filter === "late" ? "antiguos" : "próximos"} de ${filtered.length}`}{" "}
                · ordenados por{" "}
                {filter === "late" ? "días de retraso" : "vencimiento"}
              </p>
            ) : null}
            <div className="divide-y">
              {shown.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  today={today}
                  onRegisterPayment={onRegisterPayment}
                />
              ))}
            </div>
            {hidden > 0 && (
              <div className="flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
                <span>
                  {hidden} {filter === "late" ? "retrasados" : "vencimientos"}{" "}
                  más
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(true)}
                >
                  Ver los {filtered.length}{" "}
                  {filter === "late" ? "retrasados" : "pendientes"}
                </Button>
              </div>
            )}
          </div>
        )}
        {/* the year is part of the period the card describes */}
        <span className="sr-only">
          {getMonthName(month)} {year}
        </span>
      </CardContent>
    </Card>
  );
}
