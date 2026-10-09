import { PAYMENT_STATUS_LABELS } from "@/shared/constants/finance";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";

// What the history says, in Spanish (D62): the API keeps table and column names, the screen translates them

export const ENTITY_LABELS: Record<string, string> = {
  exp_daily_expenses: "Día a día",
  exp_fixed_costs: "Costo fijo",
  exp_subscriptions: "Plataforma o recurrente",
  exp_credit_card_expenses: "Gasto de tarjeta",
  exp_recurring_expenses: "Plantilla recurrente",
  exp_debts: "Deuda",
  exp_debt_payments: "Abono",
  exp_commitments: "Préstamo o inversión",
  exp_contributions: "Aporte",
  bud_monthly_budgets: "Sueldo del mes",
  bud_budget_groups: "Grupo de presupuesto",
  bud_category_budgets: "Límite por categoría",
  bud_incomes: "Ingreso",
  bud_settings: "Interruptores de presupuesto",
  cat_people: "Persona",
  cat_payment_methods: "Cuenta o tarjeta",
  cat_card_holders: "Titular de tarjeta",
  cat_categories: "Categoría",
  ntf_settings: "Notificaciones",
  imp_batches: "Importación",
  imp_statements: "Estado de cuenta",
};

export const SOURCE_LABELS: Record<string, string> = {
  web: "Web",
  bot: "Bot",
  import: "Importación",
  scheduler: "Automático",
  cli: "Script",
};

export const ACTION_LABELS: Record<string, string> = {
  create: "Creado",
  update: "Editado",
  delete: "Eliminado",
  restore: "Restaurado",
};

export const FIELD_LABELS: Record<string, string> = {
  description: "Descripción",
  name: "Nombre",
  amount: "Monto",
  othersShare: "Parte de otros",
  currency: "Moneda",
  exchangeRate: "Tipo de cambio",
  amountInPen: "Monto en soles",
  expenseType: "Tipo",
  paymentStatus: "Estado",
  status: "Estado",
  personId: "Persona",
  categoryId: "Categoría",
  paymentMethodId: "Medio de pago",
  budgetGroupId: "Grupo",
  commitmentId: "Préstamo o inversión",
  installment: "Cuota",
  paymentMonth: "Mes de pago",
  paymentYear: "Año de pago",
  paymentDate: "Fecha de pago",
  dueDate: "Vencimiento",
  attentionDate: "Fecha de atención",
  spentAt: "Fecha del gasto",
  receivedAt: "Fecha de ingreso",
  paidAt: "Fecha del abono",
  paidAmount: "Abonado",
  paidDate: "Fecha de pago",
  direction: "Sentido",
  kind: "Tipo",
  period: "Periodo",
  notes: "Notas",
  merchant: "Comercio",
  salary: "Sueldo",
  limitPercent: "Límite %",
  percentage: "Porcentaje",
  monthlyLimit: "Límite mensual",
  alertThreshold: "Alerta",
  isActive: "Activo",
  isDefault: "Por defecto",
  aliases: "Alias",
  documentNumber: "N.º de documento",
  color: "Color",
  totalAmount: "Monto total",
  installmentCount: "N.º de cuotas",
  installmentAmount: "Monto de cuota",
  dueDay: "Día de vencimiento",
  cancellationAmount: "Cancelación",
  quantity: "Cantidad",
  unit: "Unidad",
  telegram: "Telegram",
  web: "Web",
  recurringCount: "Recurrentes cuentan",
  platformsCount: "Plataformas cuentan",
  // the summary of an import
  created: "Creados",
  updated: "Actualizados",
  unchanged: "Sin cambios",
  payments: "Abonos",
  groups: "Grupos",
  budgets: "Sueldos",
  expenses: "Gastos",
  debts: "Cobros",
  commitments: "Compromisos",
  linked: "Vinculadas",
};

// Never worth showing next to the ones that changed
const HIDDEN_FIELDS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "draftId",
  "importKey",
  "originDraftId",
  "batchId",
]);

export const fieldLabel = (field: string) => FIELD_LABELS[field] ?? field;

const DATE_FIELDS = /(Date|At)$/;
const MONEY_FIELDS = new Set([
  "amount",
  "amountInPen",
  "othersShare",
  "paidAmount",
  "salary",
  "monthlyLimit",
  "totalAmount",
  "installmentAmount",
  "cancellationAmount",
]);
const BOOLEAN_FIELDS = new Set([
  "isActive",
  "isDefault",
  "telegram",
  "web",
  "recurringCount",
  "platformsCount",
]);

// A value as the person reads it: names for ids, dates, money and statuses
export function formatValue(
  field: string,
  value: unknown,
  labels: Record<string, string> = {},
  currency = "PEN",
): string {
  if (value === null || value === undefined || value === "") return "—";
  if (BOOLEAN_FIELDS.has(field))
    return value === 1 || value === true ? "Sí" : "No";
  if (typeof value === "string") {
    if (labels[value]) return labels[value];
    if (field === "paymentStatus" || field === "status")
      return PAYMENT_STATUS_LABELS[value] ?? value;
    if (DATE_FIELDS.test(field) && /^\d{4}-\d{2}-\d{2}/.test(value))
      return formatDate(value);
    return value;
  }
  if (typeof value === "number" && MONEY_FIELDS.has(field))
    return formatCurrency(value, currency);
  return String(value);
}

export interface HistoryLine {
  field: string;
  label: string;
  before: string;
  after: string;
}

interface Change {
  field: string;
  before?: unknown;
  after?: unknown;
}

// An edit says "Monto: 1,000.00 → 1,042.00"; a create or a delete lists the fields it had (without the noise)
export function describeChanges(
  action: string,
  changes: Change[],
  labels: Record<string, string> = {},
): HistoryLine[] {
  const currency = String(
    changes.find((change) => change.field === "currency")?.[
      action === "update" ? "after" : action === "delete" ? "before" : "after"
    ] ?? "PEN",
  );
  return changes
    .filter((change) => !HIDDEN_FIELDS.has(change.field))
    .filter(
      (change) =>
        action === "update" ||
        (action === "delete" ? change.before : change.after) != null,
    )
    .map((change) => ({
      field: change.field,
      label: fieldLabel(change.field),
      before: formatValue(change.field, change.before, labels, currency),
      after: formatValue(change.field, change.after, labels, currency),
    }));
}

// The fields worth showing in the short line of a create or a delete
export const SUMMARY_FIELDS = [
  "description",
  "name",
  "amount",
  "paymentStatus",
  "personId",
  "installment",
];

export type HistoryFilterId = "all" | "edits" | "status" | "files";

const FILTER_NAMES: Record<Exclude<HistoryFilterId, "all">, string> = {
  edits: "ediciones",
  status: "estado",
  files: "archivos",
};

// Textos cuando un filtro no deja nada (board 14g)
export function emptyFilterCopy(filter: Exclude<HistoryFilterId, "all">) {
  const copy = {
    edits: {
      title: "Sin ediciones",
      description:
        "Este registro todavía no tiene ediciones de campos. Prueba con otro filtro.",
    },
    status: {
      title: "Sin cambios de estado",
      description:
        "Este registro todavía no cambió de estado. Prueba con otro filtro.",
    },
    files: {
      title: "Sin cambios de archivos",
      description:
        "Todavía no se adjuntaron ni quitaron archivos. Prueba con otro filtro.",
    },
  } as const;
  return copy[filter];
}

// Pie del historial (boards 14d–14h): cuántos se ven, de cuántos, y con qué filtro
export function historyFooter({
  shown,
  loaded,
  total,
  filter,
}: {
  shown: number;
  loaded: number;
  total: number;
  filter: HistoryFilterId;
}) {
  if (filter !== "all")
    return `${shown} ${shown === 1 ? "cambio" : "cambios"} · filtro: ${FILTER_NAMES[filter][0].toUpperCase()}${FILTER_NAMES[filter].slice(1)}`;
  if (loaded < total) return `Mostrando ${loaded} de ${total} cambios`;
  return `${total} ${total === 1 ? "cambio" : "cambios"} · más recientes primero`;
}

export const HISTORY_VALUE_PREVIEW_CHARS = 120;

// «Ver completo» (board 14i): un valor largo se corta y se puede expandir
export const isLongValue = (text: string, max = HISTORY_VALUE_PREVIEW_CHARS) =>
  text.length > max;

export const truncateValue = (
  text: string,
  max = HISTORY_VALUE_PREVIEW_CHARS,
) => (isLongValue(text, max) ? `${text.slice(0, max).trimEnd()}…` : text);
