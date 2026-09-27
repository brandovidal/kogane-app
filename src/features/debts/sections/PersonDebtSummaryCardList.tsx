import { ChevronRight } from "lucide-react";
import { type DebtReportFilter } from "@/features/debts/lib/debt-report";
import type { Debt } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { Card, CardContent } from "@/ui/card";
import type { Direction } from "@/features/debts/lib/debt-filters";
import { CollectButton } from "./CollectButton";
import { DebtReportLinks as ReportLinks } from "./DebtListControls";

type PersonDebtGroup = { personId: string; name: string; total: number; debts: Debt[] };
export type StatementChargeAdjustment = {
  key: string;
  personId: string;
  personName: string;
  cardId: string;
  cardName: string;
  description: string;
  amount: number;
  periodMonth: number;
  periodYear: number;
};
export type PersonalDebtSummaryExpense = {
  id: string;
  personId: string;
  description: string;
  amount: number;
  source: string;
};

export function PersonDebtSummaryCardList({
  groups,
  statementAdjustments: statementChargeAdjustments,
  personalExpenses,
  cardNames,
  reportFilter,
  showCollections,
  showDebts,
}: {
  groups: PersonDebtGroup[];
  statementAdjustments: StatementChargeAdjustment[];
  personalExpenses: PersonalDebtSummaryExpense[];
  cardNames: Map<string, string>;
  reportFilter: DebtReportFilter;
  showCollections: boolean;
  showDebts: boolean;
}) {
  return (
    <>
{groups.map((group) => {
                      const owed = group.debts.filter(
                        (debt) => debt.direction === "owed_to_me",
                      );
                      const owe = group.debts.filter(
                        (debt) => debt.direction === "i_owe",
                      );
                      const totalOwed = owed.reduce(
                        (sum, debt) => sum + debt.balance,
                        0,
                      );
                      const statementAdjustmentsForPerson = statementChargeAdjustments.filter((item) => item.personId === group.personId);
                      const statementAdjustmentForPerson = statementAdjustmentsForPerson.reduce((sum, item) => sum + item.amount, 0);
                      const totalOwe = owe.reduce((sum, debt) => sum + debt.balance, 0);
                      const personalExpensesForPerson = personalExpenses.filter((item) => item.personId === group.personId);
                      const personalExpenseForPerson = personalExpensesForPerson.reduce((sum, item) => sum + item.amount, 0);
                      const balanceForPerson = totalOwed + statementAdjustmentForPerson - totalOwe - personalExpenseForPerson;
                      const balanceLabel = balanceForPerson > 0 ? "Por cobrar" : balanceForPerson < 0 ? "Por pagar" : "Saldo";
                      const sourceGroups = new Map<
                        string,
                        { key: string; name: string; direction: Direction; debts: Debt[]; total: number; owed: number; owe: number; collapsible: boolean; adjustments: typeof statementAdjustmentsForPerson; personalExpenses: typeof personalExpenses }
                      >();
                      for (const debt of group.debts) {
                        const description = debt.description.trim();
                        const isPlatform = /\b(stream|streaming|plataforma|netflix|spotify|youtube|icloud|disney|hbo|max|prime video|apple tv|paramount|crunchyroll|deezer|tidal|mubi|google one|dropbox)\b/i.test(description);
                        const isLoan = /pr[eé]stamo/i.test(description);
                        const isIsilIoInstallment = /\bisil\b/i.test(description);
                        const cardName = debt.paymentMethodId
                          ? cardNames.get(debt.paymentMethodId)
                          : undefined;
                        const sourceName = cardName
                          ? (/cmr|falabella/i.test(cardName) ? "CMR (Falabella)" : cardName)
                          : isIsilIoInstallment
                            ? "IO"
                            : isPlatform
                              ? "Plataformas · Stream"
                              : isLoan
                                ? "Préstamo"
                                : description;
                        const collapsible = Boolean(cardName) || isIsilIoInstallment || isPlatform || isLoan;
                        const key = collapsible ? sourceName : debt.id;
                        const sourceGroup = sourceGroups.get(key) ?? {
                          key,
                          name: sourceName,
                          direction: debt.direction,
                          debts: [],
                          total: 0,
                          owed: 0,
                          owe: 0,
                          collapsible,
                          adjustments: [],
                          personalExpenses: [],
                        };
                        sourceGroup.debts.push(debt);
                        sourceGroup.total += debt.balance;
                        if (debt.direction === "owed_to_me") sourceGroup.owed += debt.balance;
                        else sourceGroup.owe += debt.balance;
                        sourceGroups.set(key, sourceGroup);
                      }
                      for (const adjustment of statementAdjustmentsForPerson) {
                        const sourceName = /cmr|falabella/i.test(adjustment.cardName) ? "CMR (Falabella)" : adjustment.cardName;
                        const key = sourceName;
                        const sourceGroup = sourceGroups.get(key) ?? {
                          key,
                          name: sourceName,
                          direction: "owed_to_me" as Direction,
                          debts: [],
                          total: 0,
                          owed: 0,
                          owe: 0,
                          collapsible: true,
                          adjustments: [],
                          personalExpenses: [],
                        };
                        sourceGroup.adjustments.push(adjustment);
                        sourceGroup.total += adjustment.amount;
                        sourceGroup.owed += adjustment.amount;
                        sourceGroups.set(key, sourceGroup);
                      }
                      for (const expense of personalExpensesForPerson) {
                        const key = expense.source;
                        const sourceGroup = sourceGroups.get(key) ?? {
                          key,
                          name: expense.source,
                          direction: "i_owe" as Direction,
                          debts: [],
                          total: 0,
                          owed: 0,
                          owe: 0,
                          collapsible: true,
                          adjustments: [],
                          personalExpenses: [],
                        };
                        sourceGroup.personalExpenses ??= [];
                        sourceGroup.personalExpenses.push(expense);
                        sourceGroup.total += expense.amount;
                        sourceGroup.owe += expense.amount;
                        sourceGroup.collapsible = true;
                        sourceGroups.set(key, sourceGroup);
                      }
                      const summaryGroups = [...sourceGroups.values()];
                      const sourceSummaryLine = (sourceGroup: (typeof summaryGroups)[number], expandable = false) => (
                        <div className="grid grid-cols-[minmax(0,1fr)_5rem_9rem] items-center gap-2 border-t pt-2 text-sm">
                          <span className="flex min-w-0 items-center gap-2 truncate font-medium">
                            {expandable && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />}
                            {sourceGroup.name}
                          </span>
                          <span className="text-right text-xs text-muted-foreground">
                            {sourceGroup.debts.length + sourceGroup.adjustments.length + (sourceGroup.personalExpenses?.length ?? 0)} {sourceGroup.debts.length + sourceGroup.adjustments.length + (sourceGroup.personalExpenses?.length ?? 0) === 1 ? "registro" : "registros"}
                          </span>
                          <span className="flex flex-col items-end text-right text-xs tabular-nums">
                            {sourceGroup.owed > 0 && <span className="text-amber-300">+ {formatCurrency(sourceGroup.owed)}</span>}
                            {sourceGroup.owe > 0 && <span className="text-muted-foreground">− {formatCurrency(sourceGroup.owe)}</span>}
                          </span>
                        </div>
                      );
                      return (
                        <Card key={group.personId}>
                          <CardContent className="space-y-3 pt-5">
                            <div>
                              <h3 className="font-semibold">{group.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {showCollections && <span className="text-muted-foreground">Me debe <strong className="font-medium text-amber-300">{formatCurrency(totalOwed + statementAdjustmentForPerson)}</strong></span>}
                                {showCollections && showDebts && " · "}
                                {showDebts && <span className="text-muted-foreground">Le debo <strong className="font-medium">{formatCurrency(totalOwe + personalExpenseForPerson)}</strong></span>}
                              </p>
                              <p className="text-sm font-semibold text-violet-200">
                                {balanceLabel} {formatCurrency(Math.abs(balanceForPerson))}
                              </p>
                            </div>
                            <div className="space-y-2">
                              {summaryGroups.map((sourceGroup) => sourceGroup.collapsible ? (
                                <details key={sourceGroup.key} className="group border-t">
                                  <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                    {sourceSummaryLine(sourceGroup, true)}
                                  </summary>
                                  <div className="mb-2 space-y-2 border-l pl-5">
                                    {sourceGroup.debts.map((debt) => (
                                      <div key={debt.id} className="flex items-center justify-between gap-2 text-sm">
                                        <div className="min-w-0">
                                          <p className="truncate">{debt.description}{debt.installment ? ` ${debt.installment}` : ""}</p>
                                          <p className="text-xs text-muted-foreground">{getMonthName(debt.paymentMonth)} {debt.paymentYear}</p>
                                        </div>
                                        <span className="font-medium tabular-nums">{formatCurrency(debt.balance)}</span>
                                      </div>
                                    ))}
                                    {sourceGroup.adjustments.map((adjustment) => (
                                      <div key={adjustment.key} className="flex items-center justify-between gap-2 text-sm">
                                        <div className="min-w-0"><p className="truncate">{adjustment.description}</p><p className="text-xs text-muted-foreground">Comparado con estado de cuenta · {getMonthName(adjustment.periodMonth)} {adjustment.periodYear}</p></div>
                                        <span className={`font-medium tabular-nums ${adjustment.amount < 0 ? "text-emerald-300" : ""}`}>{adjustment.amount < 0 ? "−" : "+"}{formatCurrency(Math.abs(adjustment.amount))}</span>
                                      </div>
                                    ))}
                                    {sourceGroup.personalExpenses?.map((expense) => (
                                      <div key={expense.id} className="flex items-center justify-between gap-2 text-sm">
                                        <p className="min-w-0 truncate">{expense.description}</p>
                                        <span className="shrink-0 font-medium tabular-nums">{formatCurrency(expense.amount)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              ) : (
                                <div key={sourceGroup.key}>{sourceSummaryLine(sourceGroup)}</div>
                              ))}
                              <div className="grid grid-cols-[minmax(0,1fr)_5rem_9rem] items-center gap-2 border-t-2 pt-2 text-sm font-semibold">
                                <span>{balanceLabel}</span>
                                <span className="text-right text-xs font-normal text-muted-foreground">
                                  {group.debts.length + statementAdjustmentsForPerson.length + personalExpensesForPerson.length} {group.debts.length + statementAdjustmentsForPerson.length + personalExpensesForPerson.length === 1 ? "registro" : "registros"}
                                </span>
                                <span className="text-right font-bold tabular-nums text-violet-200">
                                  {formatCurrency(Math.abs(balanceForPerson))}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <ReportLinks personId={group.personId} filter={reportFilter} />
                              <CollectButton
                                name={group.name}
                                debts={owed}
                                cardNames={cardNames}
                                additionalCharges={statementAdjustmentsForPerson}
                                summaryDebts={group.debts}
                                personalExpenses={personalExpensesForPerson}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
    </>
  );
}
