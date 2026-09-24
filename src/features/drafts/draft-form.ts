import type { DraftFields } from "@/shared/api/hooks/drafts";

// Destinations offered in the web form (D40); "discard" is only for the bot
export const FORM_DESTINATIONS = ["daily", "credit_card", "fixed_cost", "subscription", "receivable", "payable"] as const;

// Which optional fields each destination uses (the same rules as REQUIRED_FIELDS_BY_DESTINATION in kogane-api)
export const FIELDS_BY_DESTINATION: Record<string, { paymentMethod: boolean; category: boolean; period: boolean; installment: boolean; cardsOnly: boolean; shareable: boolean }> = {
  daily: { shareable: true, paymentMethod: true, category: true, period: false, installment: false, cardsOnly: false },
  credit_card: { shareable: true, paymentMethod: true, category: true, period: false, installment: true, cardsOnly: true },
  fixed_cost: { shareable: true, paymentMethod: true, category: true, period: false, installment: true, cardsOnly: false },
  subscription: { shareable: true, paymentMethod: true, category: true, period: true, installment: false, cardsOnly: false },
  receivable: { shareable: false, paymentMethod: false, category: false, period: false, installment: true, cardsOnly: false },
  payable: { shareable: false, paymentMethod: false, category: false, period: false, installment: true, cardsOnly: false },
};

export const emptyDraftFields = (): DraftFields => ({
  destination: "daily",
  description: "",
  amount: null,
  currency: "PEN",
  spentAt: new Date().toISOString().slice(0, 10),
  expenseType: "essential",
  installment: null,
  period: null,
  personId: null,
  paymentMethodId: null,
  categoryId: null,
  merchant: null,
  operationNumber: null,
  notes: null,
  sharedWith: null,
});

// Only what the destination uses travels to kogane-api; empty texts become null
export function toDraftBody(fields: DraftFields): DraftFields {
  const rules = FIELDS_BY_DESTINATION[fields.destination ?? "daily"] ?? FIELDS_BY_DESTINATION.daily;
  const text = (value: string | null | undefined) => (value && value.trim() ? value.trim() : null);
  return {
    ...fields,
    description: text(fields.description),
    spentAt: fields.spentAt ? fields.spentAt.slice(0, 10) : null,
    installment: rules.installment ? text(fields.installment) : null,
    period: rules.period ? (fields.period ?? "monthly") : null,
    paymentMethodId: rules.paymentMethod ? fields.paymentMethodId : null,
    categoryId: rules.category ? fields.categoryId : null,
    merchant: text(fields.merchant),
    operationNumber: text(fields.operationNumber),
    notes: text(fields.notes),
    // debts cannot be shared (D73); a split without people stops sharing
    sharedWith: shareableWith(fields, rules.shareable),
  };
}

// Rows of the split without a person yet are left out; none left means not shared
function shareableWith(fields: DraftFields, shareable: boolean): DraftFields["sharedWith"] {
  const shares = fields.sharedWith?.shares.filter((share) => share.personId) ?? [];
  return shareable && shares.length ? { shares } : null;
}
