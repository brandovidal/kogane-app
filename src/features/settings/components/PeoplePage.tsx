import { useState } from "react";
import { LayoutGrid, Pencil, Plus, Rows3, Table2 } from "lucide-react";

import { usePeople, useSavePerson } from "@/shared/api/hooks/catalogs";
import { MultiSelect } from "@/shared/components/filters/MultiSelect";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { PERSON_MODULE_KEYS, PERSON_MODULES, type PersonModule } from "../constants";
import { PEOPLE_TABS, filterPeople, toggleModule, type PeopleTab, type Person } from "../lib/people-filter";
import { PersonDialog } from "./PersonDialog";

type View = "checks" | "compact" | "cards";
const VIEWS: [View, string, typeof Table2][] = [
  ["checks", "Checks", Table2],
  ["compact", "Compacta", Rows3],
  ["cards", "Tarjetas", LayoutGrid],
];

const moduleOptions = PERSON_MODULES.map(([value, label]) => ({
  value,
  label,
}));

// Personas (D80): who expenses and debts belong to, and in which pages each one can be picked (appearsIn).
// "Yo" is the default person and appears everywhere.
export function PeoplePage() {
  const people = usePeople().data ?? [];
  const savePerson = useSavePerson();
  const [tab, setTab] = useState<PeopleTab>("all");
  const [query, setQuery] = useState("");
  const [module, setModule] = useState<PersonModule | null>(null);
  const [view, setView] = useState<View>("checks");
  const [editing, setEditing] = useState<Person | null | undefined>(undefined); // null: new

  const visible = filterPeople(people, { tab, query, module });
  const setModules = (person: Person, appearsIn: PersonModule[]) => savePerson.mutate({ id: person.id, name: person.name, appearsIn });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as PeopleTab)}>
          <TabsList className="h-auto flex-wrap">
            {PEOPLE_TABS.map(([key, label]) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button size="sm" onClick={() => setEditing(null)}>
          <Plus className="mr-1 h-4 w-4" /> Nueva persona
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label="Buscar persona"
          placeholder="Buscar nombre o alias"
          className="w-56"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Filtrar por página"
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={module ?? ""}
          onChange={(e) => setModule((e.target.value || null) as PersonModule | null)}
        >
          <option value="">Todas las páginas</option>
          {PERSON_MODULES.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-1" role="group" aria-label="Vista">
          {VIEWS.map(([key, label, Icon]) => (
            <Button key={key} size="sm" variant={view === key ? "secondary" : "ghost"} aria-pressed={view === key} onClick={() => setView(key)}>
              <Icon className="mr-1 h-4 w-4" /> {label}
            </Button>
          ))}
        </div>
      </div>

      {visible.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No hay personas con esos filtros.</p>}

      {visible.length > 0 && view === "cards" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((person) => (
            <Card key={person.id}>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {person.name} {person.isDefault && <Badge variant="secondary">Yo</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">{person.aliases.join(", ") || "Sin alias"}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Editar ${person.name}`} onClick={() => setEditing(person)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(person.isDefault ? PERSON_MODULE_KEYS : person.appearsIn).map((key) => (
                    <Badge key={key} variant="outline">
                      {PERSON_MODULES.find(([k]) => k === key)?.[1]}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {visible.length > 0 && view !== "cards" && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                {view === "checks" ? (
                  PERSON_MODULES.map(([key, label]) => (
                    <TableHead key={key} className="text-center">
                      {label}
                    </TableHead>
                  ))
                ) : (
                  <TableHead>Aparece en</TableHead>
                )}
                <TableHead>Activa</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">
                    {person.name}{" "}
                    {person.isDefault && (
                      <Badge variant="secondary" className="ml-1">
                        Yo
                      </Badge>
                    )}
                    <span className="block text-xs font-normal text-muted-foreground">{person.aliases.join(", ")}</span>
                  </TableCell>
                  {view === "checks" ? (
                    PERSON_MODULES.map(([key, label]) => (
                      <TableCell key={key} className="text-center">
                        <Checkbox
                          checked={person.isDefault || person.appearsIn.includes(key)}
                          disabled={person.isDefault || savePerson.isPending}
                          aria-label={`${person.name} en ${label}`}
                          onCheckedChange={() => setModules(person, toggleModule(person.appearsIn, key))}
                        />
                      </TableCell>
                    ))
                  ) : (
                    <TableCell>
                      <MultiSelect
                        label={`Aparece en · ${person.name}`}
                        value={person.isDefault ? [...PERSON_MODULE_KEYS] : person.appearsIn}
                        options={moduleOptions}
                        allLabel="Ninguna"
                        emptyValueMeansAll={false}
                        searchable={false}
                        onChange={(next) => !person.isDefault && setModules(person, (next ?? []) as PersonModule[])}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Switch
                      checked={person.isActive}
                      disabled={person.isDefault}
                      aria-label={`${person.name} activa`}
                      onCheckedChange={(isActive) =>
                        savePerson.mutate({
                          id: person.id,
                          name: person.name,
                          isActive,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Editar ${person.name}`} onClick={() => setEditing(person)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editing !== undefined && <PersonDialog person={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}
