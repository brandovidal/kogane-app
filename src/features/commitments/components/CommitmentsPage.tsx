import { useMemo, useState } from "react";
import { Eye, Plus, Search } from "lucide-react";

import { useCommitments } from "@/shared/api/hooks/commitments";
import { usePeople } from "@/shared/api/hooks/catalogs";
import type { Commitment } from "@/shared/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { DataView, useViewMode, ViewToggle, type Column } from "@/shared/components/DataView";
import { withQuery } from "@/shared/api/query";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";

import { totalsOf } from "../commitment-view";
import { CommitmentCard } from "./CommitmentCard";
import { CommitmentDetail } from "./CommitmentDetail";
import { CommitmentForm } from "./CommitmentForm";

type KindFilter = "all" | "loan" | "investment";
type GroupBy = "none" | "person" | "kind";
const ALL = "__all__";

// Préstamos e inversiones: búsquedas/filtros, agrupación y vistas comparten el mismo modelo de resultados.
function CommitmentsPageView() {
  const { data: commitments = [], isLoading } = useCommitments();
  const people = usePeople().data ?? [];
  const [kind, setKind] = useState<KindFilter>("all");
  const [opened, setOpened] = useState<string | null>(null);
  const [editing, setEditing] = useState<Commitment | null | undefined>(undefined);
  const [q, setQ] = useState("");
  const [person, setPerson] = useState(ALL);
  const [currency, setCurrency] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [view, setView] = useViewMode("commitments", "cards");

  const shown = useMemo(() => commitments.filter((row) =>
    (kind === "all" || row.kind === kind) &&
    (person === ALL || row.personId === person) &&
    (currency === ALL || row.currency === currency) &&
    (status === ALL || row.status === status) &&
    (!q.trim() || `${row.name} ${row.entity ?? ""} ${row.notes ?? ""}`.toLocaleLowerCase().includes(q.trim().toLocaleLowerCase()))
  ), [commitments, kind, person, currency, status, q]);
  const totals = totalsOf(shown);
  const open = commitments.find((row) => row.id === opened) ?? null;
  const currencyOptions = [...new Set(commitments.map((row) => row.currency))];
  const personName = (id: string) => people.find((row) => row.id === id)?.name ?? "—";

  const columns: Column<Commitment>[] = [
    { key: "name", header: "Compromiso", role: "title", cell: (row) => <button type="button" className="text-left font-medium hover:underline" onClick={() => setOpened(row.id)}>{row.name}<span className="block text-xs font-normal text-muted-foreground">{row.entity ?? ""}</span></button> },
    { key: "kind", header: "Tipo", cell: (row) => row.kind === "loan" ? "Préstamo" : "Inversión" },
    { key: "person", header: "Persona", cell: (row) => personName(row.personId) },
    { key: "status", header: "Estado", cell: (row) => row.status === "active" ? "Activo" : row.status === "paid" ? "Pagado" : "Cancelado" },
    { key: "currency", header: "Moneda", cell: (row) => row.currency },
    { key: "progress", header: "Pendiente / aportado", role: "amount", cell: (row) => formatCurrency(row.progress?.pendingAmount ?? row.contributedAmount, row.currency) },
    { key: "next", header: "Próximo vencimiento", cell: (row) => row.progress?.nextDueDate ? formatDate(row.progress.nextDueDate) : "—" },
    { key: "actions", header: "", role: "actions", className: "w-14", cell: (row) => <Button variant="ghost" size="icon" aria-label={`Ver detalle de ${row.name}`} onClick={() => setOpened(row.id)}><Eye className="h-4 w-4" /></Button> },
  ];

  if (isLoading) return null;
  const groups = groupBy === "person"
    ? [...new Map(shown.map((row) => [row.personId, { key: row.personId, label: personName(row.personId), items: shown.filter((item) => item.personId === row.personId) }])).values()]
    : groupBy === "kind"
      ? (["loan", "investment"] as const).map((key) => ({ key, label: key === "loan" ? "Préstamos" : "Inversiones", items: shown.filter((row) => row.kind === key) })).filter((group) => group.items.length)
      : [{ key: "all", label: "", items: shown }];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Tabs value={kind} onValueChange={(value) => setKind(value as KindFilter)}>
          <TabsList><TabsTrigger value="all">Todos</TabsTrigger><TabsTrigger value="loan">Préstamos</TabsTrigger><TabsTrigger value="investment">Inversiones</TabsTrigger></TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-56"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar compromiso…" value={q} onChange={(event) => setQ(event.target.value)} className="h-9 pl-9" /></div>
          <Select value={person} onValueChange={setPerson}><SelectTrigger className="h-9 w-[150px]" aria-label="Filtrar por persona"><SelectValue placeholder="Persona" /></SelectTrigger><SelectContent><SelectItem value={ALL}>Todas las personas</SelectItem>{people.filter((row) => row.isActive).map((row) => <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>)}</SelectContent></Select>
          <Select value={currency} onValueChange={setCurrency}><SelectTrigger className="h-9 w-[120px]" aria-label="Filtrar por moneda"><SelectValue placeholder="Moneda" /></SelectTrigger><SelectContent><SelectItem value={ALL}>Monedas</SelectItem>{currencyOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
          <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-[135px]" aria-label="Filtrar por estado"><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value={ALL}>Todos los estados</SelectItem><SelectItem value="active">Activo</SelectItem><SelectItem value="paid">Pagado</SelectItem><SelectItem value="cancelled">Cancelado</SelectItem></SelectContent></Select>
          <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}><SelectTrigger className="h-9 w-[150px]" aria-label="Agrupar resultados"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sin agrupar</SelectItem><SelectItem value="person">Agrupar por persona</SelectItem><SelectItem value="kind">Agrupar por tipo</SelectItem></SelectContent></Select>
          <ViewToggle value={view} onChange={setView} />
          <Button size="sm" onClick={() => setEditing(null)}><Plus className="mr-1 h-4 w-4" /> Nuevo compromiso</Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{shown.length} de {commitments.length} compromisos · {totals.late} cuotas atrasadas</p>
      {shown.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Summary label="Pagado en cuotas" value={formatCurrency(totals.paid)} /><Summary label="Pendiente en cuotas" value={formatCurrency(totals.pending)} /><Summary label="Aportado a inversiones" value={formatCurrency(totals.contributed)} /><Summary label="Cuotas atrasadas" value={String(totals.late)} tone={totals.late > 0 ? "text-destructive" : undefined} /></div>}
      {shown.length === 0 ? <EmptyState title="Sin compromisos" description={commitments.length ? "No hay préstamos o inversiones con estos filtros." : "Registra un préstamo o una inversión para seguir sus cuotas, aportes y archivos."} action={!commitments.length ? <Button size="sm" onClick={() => setEditing(null)}>Nuevo compromiso</Button> : undefined} /> : (
        <div className="space-y-4">
          {groups.map((group) => <section key={group.key} className="space-y-2">{group.label && <h2 className="font-medium">{group.label}<span className="ml-2 text-xs text-muted-foreground">{group.items.length}</span></h2>}{view === "cards" && groupBy === "none" ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{group.items.map((row) => <CommitmentCard key={row.id} commitment={row} onOpen={() => setOpened(row.id)} />)}</div> : <DataView items={group.items} columns={columns} rowKey={(row) => row.id} view={view} />}</section>)}
        </div>
      )}
      {open && <CommitmentDetail key={open.id} commitment={open} onClose={() => setOpened(null)} onEdit={() => setEditing(open)} />}
      {editing !== undefined && <CommitmentForm key={editing?.id ?? "new"} commitment={editing ?? undefined} onClose={() => setEditing(undefined)} />}
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className={`text-lg font-semibold tabular-nums ${tone ?? ""}`}>{value}</p></div>;
}

export const CommitmentsPage = withQuery(CommitmentsPageView);
