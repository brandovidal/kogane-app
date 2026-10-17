import type { Commitment } from "@/shared/api/types";

// What a card or the detail says about a commitment, from the API's progress (nothing is recomputed here)
export interface CommitmentTotals {
  paid: number;
  pending: number;
  contributed: number;
  late: number;
}

// Sums of the loans and investments that are still active, in the amounts each one is in
export function totalsOf(commitments: Commitment[]): CommitmentTotals {
  const active = commitments.filter((commitment) => commitment.status === "active");
  return {
    paid: active.reduce((sum, row) => sum + (row.progress?.paidAmount ?? 0), 0),
    pending: active.reduce((sum, row) => sum + (row.progress?.pendingAmount ?? 0), 0),
    contributed: active.reduce((sum, row) => sum + row.contributedAmount, 0),
    late: active.reduce((sum, row) => sum + (row.progress?.lateCount ?? 0), 0),
  };
}

// "Cuota 13/36": the current one; before the first one starts it says so
export function currentLabel(commitment: Commitment): string | null {
  const progress = commitment.progress;
  if (!progress) return null;
  if (progress.currentInstallment === 0) return "Aún no empieza";
  return `Cuota ${progress.currentInstallment}/${progress.installmentCount}`;
}

export const percentPaid = (commitment: Commitment): number => {
  const progress = commitment.progress;
  if (!progress?.installmentCount) return 0;
  return Math.min(100, Math.round((progress.paidCount / progress.installmentCount) * 100));
};
