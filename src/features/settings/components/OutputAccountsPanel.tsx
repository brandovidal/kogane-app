import { useState } from "react";
import { Landmark, Pencil, Plus } from "lucide-react";

import { useAccounts, useSaveAccount } from "@/shared/api/hooks/catalogs";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { ACCOUNT_TYPE_LABELS, accountBody, accountErrors, emptyAccountForm, type AccountForm, type AccountType } from "../lib/account-form";

type Account = NonNullable<ReturnType<typeof useAccounts>["data"]>[number];

// Cuentas de salida: where a payment left from ("Registrar pago"). They carry no balance; one with payments is
// archived, never deleted
export function OutputAccountsPanel() {
  const accounts = useAccounts().data ?? [];
  const save = useSaveAccount();
  const [onlyActive, setOnlyActive] = useState(true);
  const [editing, setEditing] = useState<Account | null | undefined>(undefined); // null: new
  const visible = accounts.filter((account) => !onlyActive || account.isActive);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Landmark className="h-4 w-4" /> Cuentas de salida
        </CardTitle>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch checked={onlyActive} onCheckedChange={setOnlyActive} aria-label="Solo activas" />
            Solo activas
          </label>
          <Button size="sm" onClick={() => setEditing(null)}>
            <Plus className="mr-1 h-4 w-4" /> Nueva cuenta
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Sirven para decir desde dónde pagaste una cuota, un recibo o un estado de cuenta. No llevan saldo. Si ya tienen pagos se archivan en vez de
          borrarse.
        </p>
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {accounts.length === 0 ? "Aún no tienes cuentas de salida." : "No hay cuentas activas."}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead>Activa</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((account) => (
                  <TableRow key={account.id} className={account.isActive ? "" : "opacity-60"}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        {account.color && (
                          <i aria-hidden="true" className="inline-block size-2.5 rounded-full" style={{ background: account.color }} />
                        )}
                        {account.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ACCOUNT_TYPE_LABELS[account.type]}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{account.bank ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{account.currency}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={account.isActive}
                        aria-label={`${account.name} activa`}
                        onCheckedChange={(isActive) =>
                          save.mutate({
                            id: account.id,
                            name: account.name,
                            type: account.type,
                            bank: account.bank,
                            isActive,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`Editar ${account.name}`}
                        onClick={() => setEditing(account)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {editing !== undefined && <AccountDialog account={editing} onClose={() => setEditing(undefined)} />}
      </CardContent>
    </Card>
  );
}

function AccountDialog({ account, onClose }: { account: Account | null; onClose: () => void }) {
  const save = useSaveAccount();
  const [form, setForm] = useState<AccountForm>(
    account
      ? {
          name: account.name,
          type: account.type,
          bank: account.bank ?? "",
          currency: account.currency,
          color: account.color ?? "",
        }
      : emptyAccountForm(),
  );
  const [tried, setTried] = useState(false);
  const errors = accountErrors(form);
  const set = (change: Partial<AccountForm>) => setForm({ ...form, ...change });

  const submit = () => {
    setTried(true);
    if (Object.keys(errors).length) return;
    save.mutate({ id: account?.id, ...accountBody(form) }, { onSuccess: onClose });
  };

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={account ? "Editar cuenta de salida" : "Nueva cuenta de salida"}
      description="Desde dónde pagas. Se elige al registrar un pago; no lleva saldo."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={save.isPending}>
            {account ? "Guardar" : "Crear cuenta"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="account-name">
            Nombre
          </label>
          <Input id="account-name" value={form.name} onChange={(e) => set({ name: e.target.value })} />
          {tried && errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={form.type} onValueChange={(type) => set({ type: type as AccountType })}>
              <SelectTrigger aria-label="Tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Moneda</label>
            <Select value={form.currency} onValueChange={(currency) => set({ currency: currency as AccountForm["currency"] })}>
              <SelectTrigger aria-label="Moneda">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PEN">PEN · Soles</SelectItem>
                <SelectItem value="USD">USD · Dólares</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {form.type === "bank_account" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="account-bank">
              Banco
            </label>
            <Input id="account-bank" value={form.bank} onChange={(e) => set({ bank: e.target.value })} />
            {tried && errors.bank && <p className="text-xs text-destructive">{errors.bank}</p>}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="account-color">
            Color
          </label>
          <Input
            id="account-color"
            type="color"
            className="h-9 w-16 p-1"
            value={form.color || "#6366f1"}
            onChange={(e) => set({ color: e.target.value })}
          />
        </div>
      </div>
    </ResponsiveDialog>
  );
}
