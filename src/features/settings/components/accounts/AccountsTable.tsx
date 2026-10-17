import { useState } from "react";
import { CreditCard, Plus, Users } from "lucide-react";

import { usePaymentMethods, useSavePaymentMethod } from "@/shared/api/hooks/catalogs";
import { ViewToggle } from "@/shared/components/data-display/ViewToggle";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

import { CardHoldersDialog } from "./CardHoldersDialog";
import { NewCardDialog } from "./NewCardDialog";
import { PaymentMethodLabel } from "../payment-methods/PaymentMethodLabel";
import { PAYMENT_METHOD_TYPE_LABELS } from "../../constants/payment-methods";

type Method = NonNullable<ReturnType<typeof usePaymentMethods>["data"]>[number];

// Tarjetas de crédito and Débito y billeteras (P22): "La tengo" (isActive) decides the menu, the pages and the forms;
// "En el bot" (showInBot) the quick buttons of the chat. Credit cards also keep their closing and payment days (D22).
export function AccountsTable({ scope }: { scope: "credit" | "other" }) {
  const all = usePaymentMethods().data ?? [];
  const methods = all.filter((method) => (scope === "credit" ? method.type === "credit_card" : method.type !== "credit_card"));
  const credit = scope === "credit";
  const [view, setView] = useViewMode("credit-cards-settings", "cards");
  const save = useSavePaymentMethod();
  const update = (method: Method, body: Record<string, unknown>) =>
    save.mutate({
      id: method.id,
      name: method.name,
      type: method.type,
      ...body,
    });
  const day = (value: string) => (value === "" ? null : Math.min(31, Math.max(1, Number(value))));
  const [holdersOf, setHoldersOf] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [creating, setCreating] = useState(false);

  const toggles = (method: Method) => (
    <>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <Switch checked={method.isActive} aria-label={`Tengo ${method.name}`} onCheckedChange={(isActive) => update(method, { isActive })} />
        La tengo
      </label>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <Switch
          checked={method.showInBot}
          disabled={!method.isActive}
          aria-label={`${method.name} en el bot`}
          onCheckedChange={(showInBot) => update(method, { showInBot })}
        />
        En el bot
      </label>
    </>
  );
  const dayInput = (method: Method, key: "billingCloseDay" | "paymentDueDay", label: string) => (
    <Input
      type="number"
      min={1}
      max={31}
      className="h-8 w-16"
      defaultValue={method[key] ?? ""}
      aria-label={`${label} de ${method.name}`}
      onBlur={(e) => update(method, { [key]: day(e.target.value) })}
    />
  );
  const holdersButton = (method: Method) => (
    <Button variant="outline" size="sm" onClick={() => setHoldersOf({ id: method.id, name: method.name })}>
      <Users className="mr-1 h-3.5 w-3.5" /> Titular y adicionales
    </Button>
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" /> {credit ? "Tarjetas de crédito" : "Débito y billeteras"}
        </CardTitle>
        <div className="flex items-center gap-2">
          {credit && <ViewToggle view={view} onChange={setView} showLabels />}
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-1 h-4 w-4" /> {credit ? "Nueva tarjeta" : "Nuevo medio"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          {credit
            ? "Activa amortización o cashback solo en tarjetas que ofrecen esos movimientos. Los días de cierre y pago definen en qué mes cae cada compra."
            : "Una tarjeta de débito necesita su banco. «La tengo» la muestra en menús y formularios; «En el bot», en los botones del chat."}
        </p>

        {methods.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Aún no tienes {credit ? "tarjetas de crédito" : "medios de pago"}.</p>
        )}

        {credit && view === "cards" && methods.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {methods.map((method) => (
              <article key={method.id} className={`space-y-4 rounded-xl border p-4 ${method.isActive ? "" : "opacity-60"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <PaymentMethodLabel name={method.name} type={method.type} color={method.color} />
                  <div className="flex gap-4">{toggles(method)}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <label className="space-y-1">
                    Día de cierre
                    <div>{dayInput(method, "billingCloseDay", "Día de cierre")}</div>
                  </label>
                  <label className="space-y-1">
                    Día de pago
                    <div>{dayInput(method, "paymentDueDay", "Día de pago")}</div>
                  </label>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={method.supportsAmortization}
                      aria-label={`Permitir amortización en ${method.name}`}
                      onCheckedChange={(supportsAmortization) => update(method, { supportsAmortization })}
                    />
                    Amortización
                  </label>
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={method.supportsCashback}
                      aria-label={`Permitir cashback en ${method.name}`}
                      onCheckedChange={(supportsCashback) => update(method, { supportsCashback })}
                    />
                    Cashback
                  </label>
                </div>
                <div className="border-t pt-3">{holdersButton(method)}</div>
              </article>
            ))}
          </div>
        )}

        {(!credit || view === "table") && methods.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  {!credit && <TableHead>Tipo</TableHead>}
                  <TableHead>La tengo</TableHead>
                  <TableHead>En el bot</TableHead>
                  {credit && (
                    <>
                      <TableHead>Cierre</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead title="Permitir pagos adelantados para esta tarjeta">Amortización</TableHead>
                      <TableHead title="Permitir registrar devoluciones para esta tarjeta">Cashback</TableHead>
                      <TableHead>Personas</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {methods.map((method) => (
                  <TableRow key={method.id} className={method.isActive ? "" : "opacity-60"}>
                    <TableCell className="font-medium">
                      <PaymentMethodLabel name={method.name} type={method.type} color={method.color} />
                    </TableCell>
                    {!credit && <TableCell className="text-sm text-muted-foreground">{PAYMENT_METHOD_TYPE_LABELS[method.type]}</TableCell>}
                    <TableCell>
                      <Switch
                        checked={method.isActive}
                        aria-label={`Tengo ${method.name}`}
                        onCheckedChange={(isActive) => update(method, { isActive })}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={method.showInBot}
                        disabled={!method.isActive}
                        aria-label={`${method.name} en el bot`}
                        onCheckedChange={(showInBot) => update(method, { showInBot })}
                      />
                    </TableCell>
                    {credit && (
                      <>
                        <TableCell>{dayInput(method, "billingCloseDay", "Día de cierre")}</TableCell>
                        <TableCell>{dayInput(method, "paymentDueDay", "Día de pago")}</TableCell>
                        <TableCell>
                          <Switch
                            checked={method.supportsAmortization}
                            aria-label={`Permitir amortización en ${method.name}`}
                            onCheckedChange={(supportsAmortization) => update(method, { supportsAmortization })}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={method.supportsCashback}
                            aria-label={`Permitir cashback en ${method.name}`}
                            onCheckedChange={(supportsCashback) => update(method, { supportsCashback })}
                          />
                        </TableCell>
                        <TableCell>{holdersButton(method)}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {creating && <NewCardDialog onClose={() => setCreating(false)} />}
        {holdersOf && <CardHoldersDialog key={holdersOf.id} card={holdersOf} onClose={() => setHoldersOf(null)} />}
      </CardContent>
    </Card>
  );
}
