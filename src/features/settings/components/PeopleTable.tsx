import { useState } from "react";
import { Pencil, Plus, Users } from "lucide-react";

import type { Schemas } from "@/shared/api/client";
import { usePeople, useSavePerson } from "@/shared/api/hooks/catalogs";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

type Person = Schemas["PersonResponseDto"]["data"];

// Personas (D80): who expenses and debts belong to. "Yo" is the default person (D19, D71); aliases are how the bot
// recognizes them ("dany" → Danery). Deactivated people leave the selects but keep their history.
export function PeopleTable() {
  const people = usePeople().data ?? [];
  const savePerson = useSavePerson();
  const [editing, setEditing] = useState<Person | null | undefined>(undefined); // null: new

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" /> Personas
        </CardTitle>
        <Button size="sm" onClick={() => setEditing(null)}>
          <Plus className="mr-1 h-4 w-4" /> Nueva persona
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Alias (bot)</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Activa</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">
                    {person.name} {person.isDefault && <Badge variant="secondary" className="ml-1">Yo</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{person.aliases.join(", ") || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">{person.documentNumber ?? "—"}</TableCell>
                  <TableCell>
                    <Switch
                      checked={person.isActive}
                      disabled={person.isDefault}
                      aria-label={`${person.name} activa`}
                      onCheckedChange={(isActive) => savePerson.mutate({ id: person.id, name: person.name, isActive })}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Editar" onClick={() => setEditing(person)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {editing !== undefined && <PersonDialog person={editing} onClose={() => setEditing(undefined)} />}
    </Card>
  );
}

function PersonDialog({ person, onClose }: { person: Person | null; onClose: () => void }) {
  const savePerson = useSavePerson();
  const [name, setName] = useState(person?.name ?? "");
  const [aliases, setAliases] = useState(person?.aliases.join(", ") ?? "");
  const [isDefault, setIsDefault] = useState(person?.isDefault ?? false);
  // Never shown whole (D94): empty keeps the saved one, "Quitar" deletes it
  const [documentNumber, setDocumentNumber] = useState("");
  const [clearDocument, setClearDocument] = useState(false);

  const save = () =>
    savePerson.mutate(
      {
        id: person?.id,
        name: name.trim(),
        aliases: aliases.split(",").map((alias) => alias.trim()).filter(Boolean),
        isDefault,
        ...(documentNumber.trim() ? { documentNumber: documentNumber.trim() } : clearDocument ? { documentNumber: null } : {}),
      },
      { onSuccess: onClose },
    );

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={person ? "Editar persona" : "Nueva persona"}
      description="Los alias son cómo la nombras en el chat (ej: dany, mi hermana)."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!name.trim() || savePerson.isPending}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Alias separados por coma" value={aliases} onChange={(e) => setAliases(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={isDefault} onCheckedChange={setIsDefault} /> Soy yo (persona por defecto)
        </label>
        <div className="space-y-1">
          <Input
            placeholder={person?.documentNumber ? `N.º de documento (guardado ${person.documentNumber})` : "N.º de documento (DNI)"}
            value={documentNumber}
            inputMode="numeric"
            autoComplete="off"
            onChange={(e) => setDocumentNumber(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Abre los PDF de tus estados de cuenta. Se guarda en el servidor y nunca se muestra completo.
            {person?.documentNumber && !documentNumber && (
              <button type="button" className="ml-1 underline" onClick={() => setClearDocument(!clearDocument)}>
                {clearDocument ? "No quitar" : "Quitar"}
              </button>
            )}
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
