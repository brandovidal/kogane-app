import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Plus } from "lucide-react";
import { usePeople } from "@/shared/api/hooks/catalogs";
import { SUBSCRIPTION_PERIOD_LABELS, SUBSCRIPTION_PERIODS } from "@/shared/labels";

interface InlineAddCardProps {
  onSave: (values: Record<string, string>) => void;
}

// Quick add of a Plataforma: values carry personId and period as kogane-api expects them
export function InlineAddCard({ onSave }: InlineAddCardProps) {
  const people = usePeople().data?.filter((person) => person.isActive) ?? [];
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    description: "",
    amount: "",
    personId: "",
    period: "monthly",
  });
  const descRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      descRef.current?.focus();
    }
  }, [editing]);

  const reset = () => {
    setValues({ description: "", amount: "", personId: "", period: "monthly" });
    setEditing(false);
  };

  const handleSave = () => {
    if (!values.description.trim() || !values.amount.trim() || !values.personId) return;
    onSave(values);
    reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      reset();
    }
  };

  if (!editing) {
    return (
      <Card
        className="flex cursor-pointer items-center justify-center border-dashed hover:bg-muted/50"
        onClick={() => setEditing(true)}
      >
        <CardContent className="flex flex-col items-center gap-2 py-8">
          <Plus className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Nueva plataforma</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <Input
          ref={descRef}
          placeholder="Descripción..."
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          onKeyDown={handleKeyDown}
        />
        <Input
          type="number"
          placeholder="Monto"
          value={values.amount}
          onChange={(e) => setValues({ ...values, amount: e.target.value })}
          onKeyDown={handleKeyDown}
        />
        <select
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          value={values.personId}
          onChange={(e) => setValues({ ...values, personId: e.target.value })}
          onKeyDown={handleKeyDown}
        >
          <option value="">Persona...</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          value={values.period}
          onChange={(e) => setValues({ ...values, period: e.target.value })}
          onKeyDown={handleKeyDown}
        >
          {SUBSCRIPTION_PERIODS.map((p) => (
            <option key={p} value={p}>{SUBSCRIPTION_PERIOD_LABELS[p]}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={handleSave}>Guardar</Button>
          <Button size="sm" variant="outline" onClick={reset}>Cancelar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
