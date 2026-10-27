import { useEffect, useMemo, useState } from 'react'
import { Filter, LayoutGrid, Pencil, Plus, Rows3, Search, Table2 } from 'lucide-react'

import { usePeople, useSavePerson } from '@/shared/api/hooks/catalogs'
import { MultiSelect } from '@/shared/components/filters/MultiSelect'
import { UnderlineTabList } from '@/shared/components/navigation/UnderlineTabList'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Input } from '@/ui/input'
import { Skeleton } from '@/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { EMPTY_PEOPLE, PEOPLE_PAGE_SIZE, PEOPLE_TABS, PEOPLE_VIEWS, PERSON_DEBTS_LABEL, PERSON_MODULES, PERSON_MODULE_OPTIONS } from './constants'
import { filterPeople, isPersonAssigned, togglePersonModule } from './lib'
import type { PeopleTab, PeopleView, Person, PersonModule } from './types'
import { PersonIdentity } from './components/PersonIdentity'
import { PersonModules } from './components/PersonModules'
import { PersonModuleAssignments } from './components/PersonModuleAssignments'
import { PersonDialog } from './PersonDialog'

export function PeoplePage() {
  const peopleQuery = usePeople()
  const people = peopleQuery.data ?? EMPTY_PEOPLE
  const savePerson = useSavePerson()
  const [tab, setTab] = useState<PeopleTab>('all')
  const [query, setQuery] = useState('')
  const [module, setModule] = useState<PersonModule | 'debts' | null>(null)
  const [view, setView] = useState<PeopleView>('checks')
  const [editing, setEditing] = useState<Person | null | undefined>(undefined)
  const [pageSize, setPageSize] = useState(PEOPLE_PAGE_SIZE)

  const visible = useMemo(() => {
    const filtered = filterPeople(people, { tab, query, module: module === 'debts' ? null : module })
    return filtered.filter((person) => module !== 'debts' || person.isActive).sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [people, tab, query, module])
  useEffect(() => setPageSize(PEOPLE_PAGE_SIZE), [tab, query, module, view])
  const rows = visible.slice(0, pageSize)
  const counts: Record<PeopleTab, number> = {
    all: people.filter((person) => person.isActive).length,
    assigned: people.filter((person) => person.isActive && isPersonAssigned(person)).length,
    unassigned: people.filter((person) => person.isActive && !isPersonAssigned(person)).length,
    archived: people.filter((person) => !person.isActive).length,
  }
  const setModules = (person: Person, appearsIn: PersonModule[]) => savePerson.mutate({ id: person.id, name: person.name, appearsIn })
  const editButton = (person: Person) => (
    <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label={`Editar ${person.name}`} onClick={() => setEditing(person)}>
      <Pencil className="size-4" />
    </Button>
  )

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Personas</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Quién puede asignarse en cada página. Día a día siempre eres tú; Cobros y deudas muestra a todas.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={() => setEditing(null)}>
            <Plus className="mr-1.5 size-4" />
            Nueva persona
          </Button>
        </div>
      </header>

      <UnderlineTabList
        ariaLabel="Filtrar personas"
        activeKey={tab}
        items={PEOPLE_TABS.map(([key, label]) => ({ key, label, count: counts[key], onSelect: () => setTab(key) }))}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar persona"
            placeholder="Buscar persona"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <MultiSelect
          label="Filtrar por página"
          labelClassName="sr-only"
          value={module ? [module] : []}
          options={[...PERSON_MODULE_OPTIONS, { value: 'debts', label: PERSON_DEBTS_LABEL }]}
          onChange={(next) => setModule((next?.[0] as PersonModule | 'debts' | undefined) ?? null)}
          multiple={false}
          activeMarker={false}
          searchable={false}
          summaryMode="field"
          emptySelectionLabel="Aparece en: todas"
          triggerClassName="h-9 w-[13rem] justify-between"
          icon={Filter}
        />
        <div className="ml-auto flex rounded-lg border p-1" role="group" aria-label="Modo de vista">
          {PEOPLE_VIEWS.map(([key, label]) => {
            const Icon = key === 'checks' ? Table2 : key === 'compact' ? Rows3 : LayoutGrid
            return (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={view === key ? 'secondary' : 'ghost'}
                className="h-8 px-2.5"
                aria-pressed={view === key}
                onClick={() => setView(key)}
              >
                <Icon className="mr-1.5 size-4" />
                {label}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3 text-sm text-muted-foreground">
        En <span className="font-medium text-foreground">Tarjetas</span>, el titular y los adicionales se eligen solo entre las personas marcadas; si
        necesitas una que no está, la agregas desde ahí y se marca sola.
      </div>

      {peopleQuery.isLoading && (
        <div className="space-y-2 rounded-xl border p-4" aria-label="Cargando personas">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      )}
      {peopleQuery.isError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 p-4 text-sm">
          <span>No se pudieron cargar las personas.</span>
          <Button variant="outline" size="sm" onClick={() => void peopleQuery.refetch()}>
            Reintentar
          </Button>
        </div>
      )}
      {!peopleQuery.isLoading && !peopleQuery.isError && rows.length === 0 && (
        <p className="rounded-xl border py-10 text-center text-sm text-muted-foreground">No hay personas con esos filtros.</p>
      )}

      {rows.length > 0 && view === 'cards' && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((person) => (
            <Card key={person.id} className={`min-h-40 ${!person.isActive ? 'opacity-70' : ''}`}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <PersonIdentity person={person} showAlias showDocument />
                  </div>
                  {editButton(person)}
                </div>
                <PersonModules person={person} />
                {!person.isActive && <Badge variant="outline">Archivada</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {rows.length > 0 && view !== 'cards' && (
        <div className="overflow-x-auto rounded-xl border">
          <Table className={view === 'checks' ? 'min-w-[900px] table-fixed' : 'min-w-[760px] table-fixed'}>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[19%]">Nombre</TableHead>
                <TableHead className="w-[12%]">Alias (bot)</TableHead>
                <TableHead className="w-[10%]">Documento</TableHead>
                {view === 'checks' ? (
                  <>
                    {PERSON_MODULES.map(([key, label]) => (
                      <TableHead key={key} className="w-[9%] text-center">
                        {label}
                      </TableHead>
                    ))}
                    <TableHead className="w-[11%] text-center">{PERSON_DEBTS_LABEL}</TableHead>
                  </>
                ) : (
                  <TableHead className="w-[39%]">Aparece en</TableHead>
                )}
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((person) => (
                <TableRow key={person.id} className={`h-[58px] ${!person.isActive ? 'opacity-65' : ''}`}>
                  <TableCell>
                    <PersonIdentity person={person} />
                  </TableCell>
                  <TableCell className="truncate text-sm text-muted-foreground">{person.aliases.join(', ') || '—'}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{person.documentNumber || '—'}</TableCell>
                  {view === 'checks' ? (
                    <>
                      {PERSON_MODULES.map(([key, label]) => (
                        <TableCell key={key} className="px-2 text-center">
                          <span className="mx-auto flex h-6 w-16 items-center justify-center bg-muted/50">
                            <Checkbox
                              checked={person.isDefault || person.appearsIn.includes(key)}
                              disabled={person.isDefault || !person.isActive || savePerson.isPending}
                              aria-label={`${person.name} en ${label}`}
                              onCheckedChange={() => setModules(person, togglePersonModule(person.appearsIn, key))}
                            />
                          </span>
                        </TableCell>
                      ))}
                      <TableCell className="px-2 text-center">
                        <span className="mx-auto flex h-6 w-16 items-center justify-center bg-muted/50">
                          <Checkbox checked disabled aria-label={`${person.name} en ${PERSON_DEBTS_LABEL}`} />
                        </span>
                      </TableCell>
                    </>
                  ) : (
                    <TableCell>
                      <PersonModuleAssignments
                        person={person}
                        disabled={!person.isActive || savePerson.isPending}
                        onChange={(next) => setModules(person, next)}
                      />
                    </TableCell>
                  )}
                  <TableCell>{editButton(person)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {visible.length > 0 && (
        <footer className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {Math.min(pageSize, visible.length)} de {visible.length} personas
          </span>
          {pageSize < visible.length && (
            <Button variant="outline" size="sm" onClick={() => setPageSize((size) => size + PEOPLE_PAGE_SIZE)}>
              Cargar más
            </Button>
          )}
        </footer>
      )}
      {editing !== undefined && <PersonDialog person={editing} onClose={() => setEditing(undefined)} />}
    </div>
  )
}
