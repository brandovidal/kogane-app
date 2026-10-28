import type { User, UserData } from './types'

export const EMPTY_USERS: User[] = []
export const EMPTY_INVITES: UserData['invites'] = []
export const ROLE_LABELS: Record<User['role'], string> = { superadmin: 'Superadmin', admin: 'Admin', member: 'Miembro' }
export const STATUS_LABELS: Record<User['status'], string> = { active: 'Activo', invited: 'Invitado', disabled: 'Deshabilitado' }

export const PERMISSION_GROUPS = [
  {
    title: 'Sus propios datos',
    rows: [
      {
        label: 'Registrar y editar gastos, cobros y deudas',
        detail: 'Por la web, el chat de Telegram o importando',
        member: true,
        admin: true,
        superadmin: true,
      },
      { label: 'Configurar su presupuesto, tarjetas, personas y notificaciones', member: true, admin: true, superadmin: true },
      { label: 'Ver su historial de cambios y sus dispositivos', member: true, admin: true, superadmin: true },
    ],
  },
  {
    title: 'Administración',
    rows: [
      { label: 'Ver la lista de usuarios e invitaciones', member: false, admin: true, superadmin: true },
      {
        label: 'Invitar y revocar invitaciones',
        detail: 'Elige el rol de quien invita (miembro o admin)',
        member: false,
        admin: true,
        superadmin: true,
      },
      {
        label: 'Cambiar el rol y deshabilitar usuarios',
        detail: 'Deshabilitar cierra sus sesiones; sus datos se conservan',
        member: false,
        admin: true,
        superadmin: true,
      },
    ],
  },
  {
    title: 'Soporte',
    rows: [
      {
        label: 'Entrar como otro usuario por 4 horas',
        detail: 'Queda en el historial con el superadmin como autor',
        member: false,
        admin: false,
        superadmin: true,
      },
      {
        label: 'Ver los datos de otro usuario',
        detail: 'Solo entrando como él; ningún rol los ve de otra forma',
        member: false,
        admin: false,
        superadmin: true,
      },
    ],
  },
] as const
