import { NameAvatar } from '@/shared/components/data-display/NameAvatar'
import { Badge } from '@/ui/badge'
import type { PersonIdentityProps } from '../types'

export function PersonIdentity({ person, showAlias = false, showDocument = false }: PersonIdentityProps) {
  const aliasText = person.aliases.length ? `Alias: ${person.aliases.join(', ')}` : null
  const documentText = person.documentNumber ? `doc. ${person.documentNumber}` : null
  const secondary = showAlias || showDocument
    ? [aliasText, documentText].filter(Boolean).join(' · ') || 'Sin alias ni documento'
    : null
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <NameAvatar name={person.name} />
      <div className="min-w-0">
        <p className="flex min-w-0 items-center gap-1.5 font-medium">
          <span className="truncate">{person.name}</span>
          {person.isDefault && <Badge variant="secondary" className="shrink-0">Yo</Badge>}
        </p>
        {secondary && <p className="truncate text-xs text-muted-foreground">{secondary}</p>}
      </div>
    </div>
  )
}
