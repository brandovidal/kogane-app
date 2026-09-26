import { useState } from "react";
import { Plus } from "lucide-react";

import { useCommitments } from "@/shared/api/hooks/commitments";
import type { Commitment } from "@/shared/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { withQuery } from "@/shared/api/query";
import { formatCurrency } from "@/shared/lib/currency";
import { Button } from "@/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";

import { totalsOf } from "../commitment-view";
import { CommitmentCard } from "./CommitmentCard";
import { CommitmentDetail } from "./CommitmentDetail";
import { CommitmentForm } from "./CommitmentForm";

type KindFilter = "all" | "loan" | "investment";

// Préstamos e inversiones (P27, D99): BCP, Compartamos, the land, bitcoin… Each installment is a fixed cost
function CommitmentsPageView() {
  const { data: commitments = [], isLoading } = useCommitments();
  const [kind, setKind] = useState<KindFilter>("all");
  const [opened, setOpened] = useState<string | null>(null); // id: the detail
  const [editing, setEditing] = useState<Commitment | null | undefined>(undefined); // null: new

  const shown = commitments.filter((row) => kind === "all" || row.kind === kind);
  const totals = totalsOf(shown);
  const open = commitments.find((row) => row.id === opened) ?? null;
  const sample = (kind === "all" ? commitments : shown)[0];
  const money = (amount: number) => formatCurrency(amount, sample?.currency ?? "PEN");

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={kind} onValueChange={(value) => setKind(value as KindFilter)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="loan">Préstamos</TabsTrigger>
            <TabsTrigger value="investment">Inversiones</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" onClick={() => setEditing(null)}>
          <Plus className="mr-1 h-4 w-4" /> Nuevo compromiso
        </Button>
      </div>

      {shown.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Summary label="Pagado en cuotas" value={money(totals.paid)} />
          <Summary label="Pendiente en cuotas" value={money(totals.pending)} />
          <Summary label="Aportado a inversiones" value={money(totals.contributed)} />
          <Summary label="Cuotas atrasadas" value={String(totals.late)} tone={totals.late > 0 ? "text-destructive" : undefined} />
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState
          title="Sin compromisos"
          description="Registra un préstamo o una inversión para seguir sus cuotas, aportes y archivos."
          action={<Button size="sm" onClick={() => setEditing(null)}>Nuevo compromiso</Button>}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((commitment) => (
            <CommitmentCard key={commitment.id} commitment={commitment} onOpen={() => setOpened(commitment.id)} />
          ))}
        </div>
      )}

      {open && (
        <CommitmentDetail
          key={open.id}
          commitment={open}
          onClose={() => setOpened(null)}
          onEdit={() => setEditing(open)}
        />
      )}
      {editing !== undefined && <CommitmentForm key={editing?.id ?? "new"} commitment={editing ?? undefined} onClose={() => setEditing(undefined)} />}
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${tone ?? ""}`}>{value}</p>
    </div>
  );
}

export const CommitmentsPage = withQuery(CommitmentsPageView);
