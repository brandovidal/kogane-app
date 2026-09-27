import { useState, type ReactNode } from "react";
import { CreditCard, Wallet } from "lucide-react";

import { useDebts } from "@/features/debts/hooks/debts";
import { useCreditCards } from "@/shared/api/hooks/catalogs";
import type { Debt } from "@/shared/api/types";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { RecordListToolbar } from "@/shared/components/toolbar/RecordListToolbar";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { ViewToggle } from "@/shared/components/data-display/ViewToggle";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import { Button } from "@/ui/button";
import { Switch } from "@/ui/switch";
import { applyDebtFilters, DEBT_FILTER_KEYS, groupByPaymentMethod, groupByPerson, groupByPersonAndType, type DebtFilterValues, type Direction } from "@/features/debts/lib/debt-filters";
import { CardCheckPanel } from "../sections/CardCheckPanel";
import { DebtBulkBar } from "../sections/DebtBulkBar";
import { ActiveDebtFilterChips, DebtFilterSheet, DebtGroupingSheet, DebtReportLinks as ReportLinks } from "../sections/DebtListControls";
import { CollapsibleDebtGroup } from "../sections/DebtGroupsSection";
import { DebtGridSection } from "../sections/DebtGridSection";
import { DebtDialog } from "../components/dialogs/DebtDialog";
import { RegisterPaymentDialog } from "../components/dialogs/RegisterPaymentDialog";

const TEXTS: Record<Direction, { total: string; empty: string }> = {
  owed_to_me: { total: "Por cobrar", empty: "Nadie te debe nada" },
  i_owe: { total: "Por pagar", empty: "No debes nada" },
};

export function DebtListView({
  direction,
  splitGroupingSheet,
  onPay,
  actions,
}: {
  direction: Direction;
  splitGroupingSheet: boolean;
  onPay: (debt: Debt) => void;
  actions: ReactNode;
}) {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const { data: debts = [], isLoading } = useDebts({ direction });
  const cards = useCreditCards().data ?? [];
  const defaults: DebtFilterValues = {
    month: String(month),
    year: String(year),
  };
  const [filters, setFilters] = useUrlFilters<DebtFilterValues>(
    DEBT_FILTER_KEYS,
    defaults,
  );
  const [groupedByPerson, setGroupedByPerson] = useState(false);
  const [groupedByCard, setGroupedByCard] = useState(false);
  const [view, setView] = useViewMode("debts", "table");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [registering, setRegistering] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>();

  const shown = applyDebtFilters(debts, filters, { month, year });
  const total = shown.reduce((sum, debt) => sum + debt.balance, 0);
  const paid = shown.reduce((sum, debt) => sum + debt.paidAmount, 0);
  const checked = shown.filter((debt) => selected.has(debt.id));
  const card = filters.card
    ? cards.find((item) => item.id === filters.card)
    : undefined;
  const panelMonth =
    filters.month && filters.month !== "until" ? Number(filters.month) : null;
  const texts = TEXTS[direction];
  const cardNames = new Map(cards.map((c) => [c.id, c.name]));
  const personGroups = groupedByPerson ? groupByPerson(shown) : null;
  const cardGroups = groupedByCard
    ? groupByPaymentMethod(shown, cardNames)
    : null;
  const personTypeGroups =
    groupedByPerson && groupedByCard
      ? groupByPersonAndType(shown, cardNames)
      : null;

  if (isLoading) return null;

  return (
    <div className="min-w-0 space-y-4">
      <RecordListToolbar
        primary={
          <div>
            <p className="text-sm text-muted-foreground">{texts.total}</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
            <p className="text-xs text-muted-foreground">
              {shown.length} cuotas · pagado {formatCurrency(paid)}
            </p>
          </div>
        }
        actions={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <DebtFilterSheet
                value={filters}
                onChange={(next) => (setFilters(next), setSelected(new Set()))}
                debts={debts}
                cards={cards}
                monthLabel={`${getMonthName(month)} ${year}`}
                shown={shown.length}
                year={year}
                defaults={defaults}
                description="Filtra por persona, estado, período, tarjeta u origen."
                resultLabel={direction === "owed_to_me" ? "cobros" : "deudas"}
              >
                {!splitGroupingSheet && (
                  <div className="space-y-3 border-t pt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Agrupar resultados
                    </p>
                    <label className="flex items-center justify-between gap-3 text-sm">
                      <span>Por persona</span>
                      <Switch checked={groupedByPerson} onCheckedChange={setGroupedByPerson} />
                    </label>
                    <label className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" /> Por tarjeta
                      </span>
                      <Switch checked={groupedByCard} onCheckedChange={setGroupedByCard} />
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {groupedByPerson && groupedByCard
                        ? "Una tabla por persona; tarjetas y plataformas se despliegan dentro."
                        : groupedByPerson
                          ? "Los cobros se agrupan por persona."
                          : groupedByCard
                            ? "Los cobros se agrupan por tarjeta."
                            : "Activa uno o ambos para organizar los cobros."}
                    </p>
                  </div>
                )}
              </DebtFilterSheet>
              {splitGroupingSheet && (
                <DebtGroupingSheet
                  groupedByPerson={groupedByPerson}
                  groupedByCard={groupedByCard}
                  onPersonChange={setGroupedByPerson}
                  onCardChange={setGroupedByCard}
                />
              )}
              {splitGroupingSheet && (
                <span aria-hidden="true" className="hidden h-5 border-l sm:inline-block" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ReportLinks filter={{ direction, month, year }} />
              <Button size="sm" variant="outline" className="h-9" onClick={() => setRegistering(true)}>
                <Wallet className="mr-1 h-4 w-4" /> Registrar pago
              </Button>
              {actions}
            </div>
          </div>
        }
        applied={
          <ActiveDebtFilterChips
            value={filters}
            onChange={(next) => (setFilters(next), setSelected(new Set()))}
            debts={debts}
            cards={cards}
            monthLabel={`${getMonthName(month)} ${year}`}
            defaults={defaults}
            grouping={
              splitGroupingSheet
                ? {
                    byPerson: groupedByPerson,
                    byCard: groupedByCard,
                    onToggle: (key) =>
                      key === "person"
                        ? setGroupedByPerson((current) => !current)
                        : setGroupedByCard((current) => !current),
                  }
                : undefined
            }
          />
        }
        view={<ViewToggle value={view} onChange={setView} />}
      />

      {card && panelMonth && filters.year && (
        <CardCheckPanel
          cardId={card.id}
          cardName={card.name}
          month={panelMonth}
          year={Number(filters.year)}
        />
      )}

      <DebtBulkBar selected={checked} onDone={() => setSelected(new Set())} />

      {!debts.length ? (
        <EmptyState description={texts.empty} />
      ) : !shown.length ? (
        <EmptyState description="No hay cuotas con estos filtros" />
      ) : personTypeGroups ? (
        <div className="space-y-2">
          {personGroups?.map((group) => (
            <CollapsibleDebtGroup
              key={group.personId}
              title={group.name}
              total={group.total}
              debts={group.debts}
              direction={direction}
              view={view}
              onPay={onPay}
              onEdit={setEditingDebt}
              selected={selected}
              onSelectedChange={setSelected}
              groupTypes
              cardNames={cardNames}
              collapsible={false}
            />
          ))}
        </div>
      ) : cardGroups ? (
        <div className="space-y-2">
          {cardGroups.map((group) => (
            <CollapsibleDebtGroup
              key={group.cardId ?? "__no_card__"}
              title={group.cardName}
              total={group.total}
              debts={group.debts}
              direction={direction}
              view={view}
              onPay={onPay}
              onEdit={setEditingDebt}
              selected={selected}
              onSelectedChange={setSelected}
              cardNames={cardNames}
            />
          ))}
        </div>
      ) : personGroups ? (
        <div className="space-y-2">
          {personGroups.map((group) => (
            <CollapsibleDebtGroup
              key={group.personId}
              title={group.name}
              total={group.total}
              debts={group.debts}
              direction={direction}
              view={view}
              onPay={onPay}
              onEdit={setEditingDebt}
              selected={selected}
              onSelectedChange={setSelected}
              cardNames={cardNames}
              collapsible={false}
            />
          ))}
        </div>
      ) : (
        <DebtGridSection
          debts={shown}
          view={view}
          onPay={onPay}
          onEdit={setEditingDebt}
          selected={selected}
          onSelectedChange={setSelected}
        />
      )}

      <RegisterPaymentDialog
        open={registering}
        onOpenChange={setRegistering}
        debts={debts}
        period={{ month, year }}
      />
      <DebtDialog open={!!editingDebt} onOpenChange={(open) => !open && setEditingDebt(undefined)} direction={direction} debt={editingDebt} />
    </div>
  );
}
