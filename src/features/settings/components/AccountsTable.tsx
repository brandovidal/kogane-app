import { useState } from "react";
import { CreditCard, Plus, Users } from "lucide-react";

import { usePaymentMethods, useSavePaymentMethod } from "@/shared/api/hooks/catalogs";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

import { CardHoldersDialog } from "./CardHoldersDialog";
import { NewCardDialog } from "./NewCardDialog";

const TYPE_LABELS: Record<string, string> = {
  credit_card: "Tarjeta de crédito",
  debit_card: "Débito",
  wallet: "Billetera",
  cash: "Efectivo",
  bank_transfer: "Transferencia",
};

// Cuentas y tarjetas (P22): "La tengo" (isActive) decides the menu, the pages and the forms; "En el bot" (showInBot)
// the quick buttons of the chat. Cards also keep their closing and payment days (billing month, D22).
export function AccountsTable() {
  const methods = usePaymentMethods().data ?? [];
  const save = useSavePaymentMethod();
  const update = (id: string, name: string, type: string, body: Record<string, unknown>) =>
    save.mutate({ id, name, type: type as never, ...body });
  const day = (value: string) => (value === "" ? null : Math.min(31, Math.max(1, Number(value))));
  const [holdersOf, setHoldersOf] = useState<{ id: string; name: string } | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" /> Cuentas y tarjetas
        </CardTitle>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="mr-1 h-4 w-4" /> Nueva tarjeta
        </Button>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          Activa amortización o cashback solo en tarjetas que ofrecen esos movimientos. IO viene habilitada inicialmente; puedes ajustar cada tarjeta aquí.
        </p>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>La tengo</TableHead>
                <TableHead>En el bot</TableHead>
                <TableHead>Cierre</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead title="Permitir pagos adelantados para esta tarjeta">Amortización</TableHead>
                <TableHead title="Permitir registrar devoluciones para esta tarjeta">Cashback</TableHead>
                <TableHead>Personas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((method) => (
                <TableRow key={method.id} className={method.isActive ? "" : "opacity-60"}>
                  <TableCell className="font-medium">{method.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{TYPE_LABELS[method.type] ?? method.type}</TableCell>
                  <TableCell>
                    <Switch
                      checked={method.isActive}
                      aria-label={`Tengo ${method.name}`}
                      onCheckedChange={(isActive) => update(method.id, method.name, method.type, { isActive })}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={method.showInBot}
                      disabled={!method.isActive}
                      aria-label={`${method.name} en el bot`}
                      onCheckedChange={(showInBot) => update(method.id, method.name, method.type, { showInBot })}
                    />
                  </TableCell>
                  {method.type === "credit_card" ? (
                    <>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          className="h-8 w-16"
                          defaultValue={method.billingCloseDay ?? ""}
                          aria-label={`Día de cierre de ${method.name}`}
                          onBlur={(e) => update(method.id, method.name, method.type, { billingCloseDay: day(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          className="h-8 w-16"
                          defaultValue={method.paymentDueDay ?? ""}
                          aria-label={`Día de pago de ${method.name}`}
                          onBlur={(e) => update(method.id, method.name, method.type, { paymentDueDay: day(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={method.supportsAmortization}
                          aria-label={`Permitir amortización en ${method.name}`}
                          onCheckedChange={(supportsAmortization) => update(method.id, method.name, method.type, { supportsAmortization })}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={method.supportsCashback}
                          aria-label={`Permitir cashback en ${method.name}`}
                          onCheckedChange={(supportsCashback) => update(method.id, method.name, method.type, { supportsCashback })}
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setHoldersOf({ id: method.id, name: method.name })}>
                          <Users className="mr-1 h-3.5 w-3.5" /> Titular y adicionales
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {creating && <NewCardDialog onClose={() => setCreating(false)} />}
        {holdersOf && <CardHoldersDialog key={holdersOf.id} card={holdersOf} onClose={() => setHoldersOf(null)} />}
      </CardContent>
    </Card>
  );
}
