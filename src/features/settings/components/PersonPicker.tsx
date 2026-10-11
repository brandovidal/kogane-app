import { useState } from "react";
import { Plus } from "lucide-react";

import { usePeople, useSavePerson } from "@/shared/api/hooks/catalogs";
import { NameAvatar } from "@/shared/components/data-display/NameAvatar";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { MultiSelect } from "@/shared/components/filters/MultiSelect";
import type { CatalogSelectProps } from "@/shared/types/catalog-select";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { PERSON_MODULE_LABELS, type PersonModule } from "../constants/people";

interface PersonPickerProps extends CatalogSelectProps {
  /** The page of the record: people marked there come first and the others are marked when picked. */
  module?: PersonModule;
}

// The person of a record (Costos fijos, Plataformas, Tarjetas, Recurrentes, Cobros…): the people marked for this page,
// then the others, and "Nueva persona" without leaving the form. Picking someone who is not marked yet, or creating
// one, marks them for this page so the next form already offers them (Configuración ▸ Personas)
export function PersonPicker({
  value,
  onChange,
  placeholder = "Selecciona persona",
  className,
  disabled,
  module,
}: PersonPickerProps) {
  const people = usePeople().data ?? [];
  const savePerson = useSavePerson();
  const [creating, setCreating] = useState(false);
  const pageLabel = module ? PERSON_MODULE_LABELS[module] : null;

  const visible = people.filter(
    (person) => person.isActive || person.id === value,
  );
  const options = visible.map((person) => {
    const available =
      !module || person.isDefault || person.appearsIn.includes(module);
    return {
      value: person.id,
      label: person.name,
      decoration: <NameAvatar name={person.name} />,
      searchTerms: person.aliases,
      group: !module
        ? undefined
        : available
          ? `Disponibles en ${pageLabel}`
          : `Otras · se marcarán en ${pageLabel}`,
    };
  });
  // The groups appear in this order: the page's people first
  options.sort((a, b) => (a.group ?? "").localeCompare(b.group ?? ""));

  const pick = (id: string | null) => {
    if (!id) return onChange(null);
    const person = people.find((candidate) => candidate.id === id);
    if (
      module &&
      person &&
      !person.isDefault &&
      !person.appearsIn.includes(module)
    ) {
      savePerson.mutate(
        {
          id: person.id,
          name: person.name,
          appearsIn: [...person.appearsIn, module],
        },
        { onSuccess: () => onChange(id) },
      );
      return;
    }
    onChange(id);
  };

  return (
    <>
      <MultiSelect
        label="Persona"
        labelClassName="sr-only"
        value={value ? [value] : []}
        options={options}
        onChange={(next) => pick(next?.[0] ?? null)}
        multiple={false}
        activeMarker={false}
        summaryMode="person"
        presentation="popover"
        emptySelectionLabel={placeholder}
        triggerClassName={className}
        highlightMatches
        emptyDescription={(query) => <>Nadie coincide con «{query}».</>}
        footerAction={(close) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            disabled={disabled}
            onClick={() => {
              close();
              setCreating(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Nueva persona
          </Button>
        )}
      />
      {creating && (
        <QuickPersonDialog
          module={module}
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false);
            onChange(id);
          }}
        />
      )}
    </>
  );
}

// The minimum to start using someone; the rest (document, other pages) is completed in Configuración ▸ Personas
function QuickPersonDialog({
  module,
  onClose,
  onCreated,
}: {
  module?: PersonModule;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const savePerson = useSavePerson();
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");

  const create = () =>
    savePerson.mutate(
      {
        name: name.trim(),
        ...(alias.trim() ? { aliases: [alias.trim()] } : {}),
        ...(module ? { appearsIn: [module] } : {}),
      },
      { onSuccess: (person) => onCreated(person.id) },
    );

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Nueva persona"
      description={
        module
          ? `Se marca solo en ${PERSON_MODULE_LABELS[module]}. El resto lo completas en Configuración ▸ Personas.`
          : "El resto lo completas en Configuración ▸ Personas."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={create}
            disabled={!name.trim() || savePerson.isPending}
          >
            Crear y usar
          </Button>
        </>
      }
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) create();
        }}
      >
        <Input
          autoFocus
          placeholder="Nombre"
          aria-label="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          placeholder="Alias para el bot (opcional)"
          aria-label="Alias para el bot"
          value={alias}
          onChange={(event) => setAlias(event.target.value)}
        />
      </form>
    </ResponsiveDialog>
  );
}
