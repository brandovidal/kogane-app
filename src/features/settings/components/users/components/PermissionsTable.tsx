import { Fragment } from 'react'
import { Check, Shield } from 'lucide-react'
import { InlineAlert } from '@/shared/components'
import { InlineAlertDescription } from '@/shared/components'
import { Card } from '@/ui/card'
import { PERMISSION_GROUPS } from '../constants'

export function PermissionsTable() {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-muted-foreground">
              <th className="w-[52%] px-5 py-3 text-left font-medium">Qué puede hacer</th>
              <th className="px-4 py-3 text-center font-medium">Miembro</th>
              <th className="px-4 py-3 text-center font-medium">Admin</th>
              <th className="px-4 py-3 text-center font-medium">Superadmin</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((group) => (
              <Fragment key={group.title}>
                <tr className="border-y bg-muted/30">
                  <th colSpan={4} className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
                    {group.title}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium">{row.label}</p>
                      {'detail' in row && <p className="text-muted-foreground">{row.detail}</p>}
                    </td>
                    {(['member', 'admin', 'superadmin'] as const).map((role) => (
                      <td key={role} className="px-4 py-3 text-center">
                        {row[role] ? <Check className="mx-auto size-5 text-muted-foreground" /> : <span className="text-muted-foreground">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="flex gap-3 p-4">
        <Shield className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <div>
          <p className="font-semibold">
            Permisos por módulo <span className="ml-2 text-sm font-medium text-amber-400">Próximamente</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Por ejemplo, que un miembro solo vea Cobros y deudas, o que un admin no pueda deshabilitar. Hoy solo existen los tres roles de arriba.
          </p>
        </div>
      </Card>
      <InlineAlert className="border-amber-500/30 bg-amber-500/5 text-amber-300">
        <Shield className="size-4" />
        <InlineAlertDescription>
          El superadmin no se crea desde la web: se crea desde el servidor para que nadie pueda ascenderse a sí mismo.
        </InlineAlertDescription>
      </InlineAlert>
    </div>
  )
}
