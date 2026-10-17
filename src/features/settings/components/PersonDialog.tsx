import { useState } from "react";

import type { Schemas } from "@/shared/api/client";
import { useSavePerson } from "@/shared/api/hooks/catalogs";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { MultiSelect } from "@/shared/components/filters/MultiSelect";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { PERSON_MODULE_KEYS, PERSON_MODULES, type PersonModule } from "../constants";

type Person = Schemas["PersonResponseDto"]["data"];

export function PersonDialog({ person, onClose }: { person: Person | null; onClose: () => void }) {
  const savePerson = useSavePerson();
  const [name, setName] = useState(person?.name ?? "");
  const [aliases, setAliases] = useState(person?.aliases.join(", ") ?? "");
  const [isDefault, setIsDefault] = useState(person?.isDefault ?? false);
  const [appearsIn, setAppearsIn] = useState<PersonModule[]>(person?.appearsIn ?? []);
  // Never shown whole (D94): empty keeps the saved one, "Quitar" deletes it
  const [documentNumber, setDocumentNumber] = useState("");
  const [clearDocument, setClearDocument] = useState(false);

  const save = () =>
    savePerson.mutate(
      {
        id: person?.id,
        name: name.trim(),
        aliases: aliases
          .split(",")
          .map((alias) => alias.trim())
          .filter(Boolean),
        isDefault,
        appearsIn: isDefault ? [...PERSON_MODULE_KEYS] : appearsIn,
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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!name.trim() || savePerson.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Alias separados por coma" value={aliases} onChange={(e) => setAliases(e.target.value)} />
        <MultiSelect
          label="Aparece en"
          value={isDefault ? [...PERSON_MODULE_KEYS] : appearsIn}
          options={PERSON_MODULES.map(([value, label]) => ({ value, label }))}
          onChange={(next) => setAppearsIn((next ?? []) as PersonModule[])}
          allLabel="Ninguna página"
          emptyValueMeansAll={false}
          searchable={false}
        />
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
