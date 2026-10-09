import {
  useCategories,
  usePaymentMethods,
  usePeople,
} from "@/shared/api/hooks/catalogs";
import {
  EXPENSE_TYPE_LABELS,
  NO_PAYMENT_STATUS_FILTER,
  PAYMENT_STATUS_LABELS,
} from "@/shared/constants/finance";
import { SUBSCRIPTION_PERIOD_LABELS } from "@/features/subscriptions/constants/subscriptions";
import { PAYMENT_METHOD_TYPE_LABELS } from "@/features/settings/constants/payment-methods";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import type { AppliedFilterChip } from "@/shared/components/filters/AppliedFilterChips";
import {
  INSTALLMENT_FILTER,
  PERSON_ALL,
  PERSON_FILTER_LABELS,
  PERSON_ME,
  PERSON_UNASSIGNED,
  SHARED_FILTER,
} from "../constants/expense-filters";
import type { ActiveExpenseFilterChipsOptions } from "../types/expense-filter-props";
import type { ExpenseFilterKey } from "../types/expense-filters";

export function useActiveExpenseFilterChips<
  T extends string | string[] = string,
>({
  fields,
  value,
  onChange,
  me,
  groupBy,
  onGroupByChange,
  groupByLabel,
  groupByLabels,
  periodChip,
  formatFilterLabel,
  showClearAll = true,
  onClearAll,
}: ActiveExpenseFilterChipsOptions<T>) {
  const categories = useCategories().data ?? [];
  const methods = usePaymentMethods().data ?? [];
  const people = usePeople().data ?? [];
  const personName = (id: string) =>
    people.find((person) => person.id === id)?.name ?? id;
  const meName = me ? personName(me) : PERSON_FILTER_LABELS.ME;
  const selectedPersonIds = new Set(
    (value.person ?? "").split(",").filter((id) => id && id !== PERSON_ALL),
  );
  const knownPersonIds = new Set(
    people.flatMap((person) =>
      person.isDefault ? [person.id, PERSON_ME] : [person.id],
    ),
  );
  knownPersonIds.add(PERSON_UNASSIGNED);
  const allPeopleSelected =
    people.length > 0 &&
    people.every(
      (person) =>
        selectedPersonIds.has(person.id) ||
        (person.isDefault && selectedPersonIds.has(PERSON_ME)),
    ) &&
    [...selectedPersonIds].every((id) => knownPersonIds.has(id));

  const labels: Partial<Record<ExpenseFilterKey, string>> = {
    q: value.q?.trim() ? `Buscar: ${value.q.trim()}` : undefined,
    month: value.month
      ? `Mes: ${getMonthName(Number(value.month))}`
      : undefined,
    year: value.year ? `Año: ${value.year}` : undefined,
    person:
      value.person && value.person !== PERSON_ALL
        ? allPeopleSelected
          ? "Persona: Todos"
          : `Persona: ${value.person
              .split(",")
              .filter(Boolean)
              .map((id) =>
                id === PERSON_UNASSIGNED
                  ? "Sin asignar"
                  : id === PERSON_ME || id === me
                    ? meName
                    : personName(id),
              )
              .join(", ")}`
        : undefined,
    category: value.category
      ? `Categoría: ${value.category
          .split(",")
          .filter(Boolean)
          .map(
            (id) =>
              categories.find((category) => category.id === id)?.name ?? id,
          )
          .join(", ")}`
      : undefined,
    method: value.method
      ? `Medio de pago: ${methods.find((method) => method.id === value.method)?.name ?? value.method}`
      : undefined,
    currency: value.currency ? `Moneda: ${value.currency}` : undefined,
    status: value.status
      ? `Estado: ${
          value.status === NO_PAYMENT_STATUS_FILTER
            ? "Ninguno"
            : value.status
                .split(",")
                .map((status) => PAYMENT_STATUS_LABELS[status] ?? status)
                .join(", ")
        }`
      : undefined,
    type: value.type
      ? `Tipo: ${EXPENSE_TYPE_LABELS[value.type] ?? value.type}`
      : undefined,
    shared: value.shared
      ? `Compartidos: ${value.shared === SHARED_FILTER.SHARED ? "Sí" : "No"}`
      : undefined,
    period: value.period
      ? `Período: ${SUBSCRIPTION_PERIOD_LABELS[value.period] ?? value.period}`
      : undefined,
    installments: value.installments
      ? `Cuotas: ${value.installments === INSTALLMENT_FILTER.WITH ? "Con cuotas" : "Sin cuotas"}`
      : undefined,
    dueFrom: value.dueFrom
      ? `Vence desde: ${formatDate(value.dueFrom)}`
      : undefined,
    dueTo: value.dueTo ? `Vence hasta: ${formatDate(value.dueTo)}` : undefined,
    hasNote: value.hasNote
      ? value.hasNote === "yes"
        ? "Con nota"
        : "Sin nota"
      : undefined,
    amountFrom:
      value.amountFrom || value.amountTo
        ? `Monto: ${value.amountFrom || "0"} – ${value.amountTo || "Sin límite"}`
        : undefined,
    amountTo: undefined,
    methodType: value.methodType
      ? `Medio de pago: ${PAYMENT_METHOD_TYPE_LABELS[value.methodType as keyof typeof PAYMENT_METHOD_TYPE_LABELS] ?? value.methodType}`
      : undefined,
  };

  const chips: AppliedFilterChip[] = [
    ...(periodChip
      ? [
          {
            key: periodChip.key ?? "period-chip",
            label: periodChip.label,
            onRemove: periodChip.onRemove,
          },
        ]
      : []),
    ...fields
      .filter(
        (key) =>
          labels[key] && !(periodChip && (key === "month" || key === "year")),
      )
      .map((key) => ({
        key,
        label: formatFilterLabel?.(key, labels[key]!) ?? labels[key]!,
        onRemove: () =>
          key === "amountFrom"
            ? onChange({ ...value, amountFrom: undefined, amountTo: undefined })
            : onChange({ ...value, [key]: undefined }),
      })),
  ];

  const isGrouped = Array.isArray(groupBy)
    ? groupBy.length > 0
    : !!groupBy && groupBy !== "none";

  if (isGrouped && groupBy !== undefined && onGroupByChange) {
    const groupFields = Array.isArray(groupBy)
      ? groupBy.map(String)
      : [String(groupBy)];

    if (Array.isArray(groupBy)) {
      const groupLabels = groupFields.map((field) =>
        (groupByLabels?.[field] ?? field)
          .replace(/^Por\s+/i, "")
          .replace(/^./, (letter) => letter.toLocaleUpperCase()),
      );
      chips.push({
        key: "group-by",
        label: groupLabels.join(" › "),
        onRemove: () => onGroupByChange([] as unknown as T),
        kind: "group",
      });
    } else {
      const field = groupFields[0];
      const label = groupByLabels?.[field] ?? groupByLabel ?? field;
      chips.push({
        key: `group-by-${field}`,
        label: `Agrupar: ${label}`,
        onRemove: () => onGroupByChange("none" as T),
        kind: "group",
      });
    }
  }

  const clearAll = showClearAll
    ? () => {
        if (onClearAll) onClearAll();
        else {
          onChange({});
          if (isGrouped && onGroupByChange) {
            onGroupByChange((Array.isArray(groupBy) ? [] : "none") as T);
          }
        }
      }
    : undefined;

  return { chips, isGrouped, clearAll };
}
