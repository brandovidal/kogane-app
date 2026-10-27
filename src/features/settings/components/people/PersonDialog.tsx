import { useState } from 'react'
import { Archive, RotateCcw, UserRound } from 'lucide-react'

import { useSavePerson } from '@/shared/api/hooks/catalogs'
import { NameAvatar } from '@/shared/components/data-display/NameAvatar'
import { ResponsiveDialog } from '@/shared/components/dialogs/ResponsiveDialog'
import { MultiSelect } from '@/shared/components/filters/MultiSelect'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import { PERSON_MODULE_KEYS, PERSON_MODULE_OPTIONS } from './constants'
import { useAssignedSummary } from './hooks/useAssignedSummary'
import type { Person, PersonModule } from './types'

export function PersonDialog({ person, onClose }: { person: Person | null; onClose: () => void }) {
  const savePerson = useSavePerson()
  const [name, setName] = useState(person?.name ?? '')
  const [aliases, setAliases] = useState(person?.aliases.join(', ') ?? '')
  const [isDefault, setIsDefault] = useState(person?.isDefault ?? false)
  const [appearsIn, setAppearsIn] = useState<PersonModule[]>(person?.appearsIn ?? [])
  const [documentNumber, setDocumentNumber] = useState('')
  const [clearDocument, setClearDocument] = useState(false)
  const summary = useAssignedSummary(person, appearsIn, isDefault)

  const save = () =>
    savePerson.mutate(
      {
        id: person?.id,
        name: name.trim(),
        aliases: aliases
          .split(',')
          .map((alias) => alias.trim())
          .filter(Boolean),
        isDefault,
        isActive: person?.isActive ?? true,
        appearsIn: isDefault ? [...PERSON_MODULE_KEYS] : appearsIn,
        ...(documentNumber.trim() ? { documentNumber: documentNumber.trim() } : clearDocument ? { documentNumber: null } : {}),
      },
      { onSuccess: onClose },
    )
  const setArchived = (isActive: boolean) => {
    if (!person) return
    savePerson.mutate({ id: person.id, name: person.name, isActive }, { onSuccess: onClose })
  }
  const defaultChanged = (value: boolean) => {
    setIsDefault(value)
    if (value) setAppearsIn([...PERSON_MODULE_KEYS])
  }

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={person?.name ?? 'Nueva persona'}
      icon={person ? <NameAvatar name={person.name} /> : <UserRound aria-hidden="true" className="size-4 text-primary" />}
      description={person ? summary : 'Asígnala en las páginas donde quieras seleccionarla.'}
      contentClassName="sm:max-w-3xl bg-card"
      footer={
        <div className="flex w-full flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
          {person &&
            !person.isDefault &&
            (person.isActive ? (
              <Button
                type="button"
                variant="ghost"
                className="justify-start text-destructive hover:text-destructive"
                onClick={() => setArchived(false)}
                disabled={savePerson.isPending}
              >
                <Archive className="mr-1.5 size-4" />
                Archivar persona
              </Button>
            ) : (
              <Button type="button" variant="ghost" className="justify-start" onClick={() => setArchived(true)} disabled={savePerson.isPending}>
                <RotateCcw className="mr-1.5 size-4" />
                Restaurar persona
              </Button>
            ))}
          <div className="ml-auto flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={save} disabled={!name.trim() || savePerson.isPending}>
              {savePerson.isPending ? 'Guardando…' : person ? 'Guardar' : 'Crear persona'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {person && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
            <NameAvatar name={person.name} />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {person.name}
                {isDefault && (
                  <Badge variant="secondary" className="ml-2">
                    Yo
                  </Badge>
                )}
              </p>
              <p className="truncate text-sm text-muted-foreground">{summary}</p>
            </div>
          </div>
        )}
        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="person-name" className="text-sm font-medium">
              Nombre
            </label>
            <Input
              id="person-name"
              autoFocus={!person}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre completo"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="person-aliases" className="text-sm font-medium">
              Alias (bot)
            </label>
            <Input id="person-aliases" value={aliases} onChange={(event) => setAliases(event.target.value)} placeholder="Separados por coma" />
            <p className="text-xs text-muted-foreground">Puedes agregar varios, separados por coma.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="person-document" className="text-sm font-medium">
              Documento
            </label>
            <Input
              id="person-document"
              value={documentNumber}
              placeholder={person?.documentNumber ? `Documento guardado · ${person.documentNumber}` : 'DNI (opcional)'}
              inputMode="numeric"
              autoComplete="off"
              onChange={(event) => {
                setDocumentNumber(event.target.value)
                if (event.target.value) setClearDocument(false)
              }}
            />
            <p className="text-xs text-muted-foreground">
              Se guarda en el servidor y nunca se muestra completo.
              {person?.documentNumber && !documentNumber && (
                <button type="button" className="ml-1 underline" onClick={() => setClearDocument((current) => !current)}>
                  {clearDocument ? 'No quitar' : 'Quitar documento'}
                </button>
              )}
            </p>
          </div>
        </div>

        <section className="space-y-2">
          <label className="text-sm font-medium">Aparece en</label>
          <MultiSelect
            label="Aparece en"
            labelClassName="sr-only"
            value={isDefault ? [...PERSON_MODULE_KEYS] : appearsIn}
            options={PERSON_MODULE_OPTIONS}
            onChange={(next) => setAppearsIn((next ?? []) as PersonModule[])}
            allLabel="Todas"
            emptySelectionLabel="Ninguna página"
            emptyValueMeansAll={false}
            searchable={false}
            triggerClassName="min-h-11"
          />
          <p className="text-xs text-muted-foreground">Cobros y deudas siempre la incluye. Día a día es solo tuyo.</p>
        </section>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Persona por defecto</p>
            <p className="text-xs text-muted-foreground">Se usa como “Yo” y aparece en todas las páginas.</p>
          </div>
          <Switch checked={isDefault} onCheckedChange={defaultChanged} aria-label="Persona por defecto" />
        </div>
      </div>
    </ResponsiveDialog>
  )
}
