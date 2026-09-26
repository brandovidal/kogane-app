import { CalendarClock, Paperclip, TriangleAlert } from "lucide-react";

import type { Commitment } from "@/shared/api/types";
import { COMMITMENT_KIND_LABELS, COMMITMENT_STATUS_LABELS, COMMITMENT_SUBTYPE_LABELS } from "@/shared/labels";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { Card, CardContent } from "@/ui/card";
import { Progress } from "@/ui/progress";

import { currentLabel, percentPaid } from "../commitment-view";

const Stat = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`text-sm font-semibold tabular-nums ${tone ?? ""}`}>{value}</p>
  </div>
);

// One loan or investment: where it stands today (P27). Click opens the detail
export function CommitmentCard({ commitment, onOpen }: { commitment: Commitment; onOpen: () => void }) {
  const { progress, currency } = commitment;
  const money = (amount: number) => formatCurrency(amount, currency);

  return (
    <Card className="cursor-pointer transition-colors hover:bg-muted/40" onClick={onOpen}>
      <CardContent className="space-y-4 p-4">
        <button type="button" className="flex w-full items-start justify-between gap-2 text-left">
          <div className="min-w-0">
            <p className="truncate font-semibold">{commitment.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {commitment.entity ? `${commitment.entity} · ` : ""}
              {COMMITMENT_SUBTYPE_LABELS[commitment.subtype] ?? commitment.subtype}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge variant={commitment.status === "active" ? "secondary" : "outline"}>
              {COMMITMENT_STATUS_LABELS[commitment.status] ?? commitment.status}
            </Badge>
            {commitment.kind === "investment" && <Badge variant="outline">{COMMITMENT_KIND_LABELS.investment}</Badge>}
          </div>
        </button>

        {progress ? (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{currentLabel(commitment)}</span>
                <span className="text-xs text-muted-foreground">
                  {progress.paidCount} de {progress.installmentCount} pagadas
                </span>
              </div>
              <Progress value={percentPaid(commitment)} aria-label="Cuotas pagadas" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Pagado" value={money(progress.paidAmount)} />
              <Stat label="Pendiente" value={money(progress.pendingAmount)} />
              <Stat
                label="Cancelación"
                value={commitment.cancellationAmount != null ? money(commitment.cancellationAmount) : "—"}
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {progress.nextDueDate && (
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" /> Próxima: {formatDate(progress.nextDueDate)}
                </span>
              )}
              {progress.lateCount > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-destructive">
                  <TriangleAlert className="h-3.5 w-3.5" /> {progress.lateCount} atrasada(s)
                </span>
              )}
              {progress.createdCount < progress.installmentCount && (
                <span>Faltan crear {progress.installmentCount - progress.createdCount} cuotas</span>
              )}
              {commitment.attachmentCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Paperclip className="h-3.5 w-3.5" /> {commitment.attachmentCount}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Total invertido" value={money(commitment.contributedAmount)} />
            <Stat label="Aportes" value={String(commitment.contributionCount)} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
