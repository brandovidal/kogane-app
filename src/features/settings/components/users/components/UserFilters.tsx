import { Input } from '@/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import type { RoleFilter, StatusFilter } from '../types'

export function UserFilters({
  search,
  onSearch,
  role,
  onRole,
  status,
  onStatus,
}: {
  search: string
  onSearch: (value: string) => void
  role: RoleFilter
  onRole: (value: RoleFilter) => void
  status: StatusFilter
  onStatus: (value: StatusFilter) => void
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input
        aria-label="Buscar usuario"
        placeholder="Buscar por nombre o correo"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        className="sm:max-w-md"
      />
      <Select value={role} onValueChange={(value) => onRole(value as RoleFilter)}>
        <SelectTrigger className="sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Rol: todos</SelectItem>
          <SelectItem value="member">Miembro</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="superadmin">Superadmin</SelectItem>
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={(value) => onStatus(value as StatusFilter)}>
        <SelectTrigger className="sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Estado: todos</SelectItem>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="disabled">Deshabilitado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
