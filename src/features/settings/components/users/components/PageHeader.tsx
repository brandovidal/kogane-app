import { UserPlus } from 'lucide-react'
import { Button } from '@/ui/button'

export function PageHeader({ onInvite }: { onInvite: () => void }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-3xl space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Quién entra a Kogane y con qué rol. Cada usuario ve solo sus propios datos, también los administradores.
        </p>
      </div>
      <Button className="shrink-0" onClick={onInvite}>
        <UserPlus className="mr-2 size-4" />
        Invitar usuario
      </Button>
    </header>
  )
}
