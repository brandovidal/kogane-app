import type { NotificationGroup } from './types'

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    label: 'Pagos y vencimientos',
    items: [
      { kind: 'due', title: 'Vencimientos', description: 'Un día antes, 09:00. Lo que cierra o vence y sigue sin pagar.' },
      { kind: 'card_close', title: 'Cierre de tarjetas', description: 'El día antes del cierre de cada tarjeta.' },
      { kind: 'statement', title: 'Estados de cuenta conciliados', description: 'Cuando un estado de cuenta termina de leerse y cuadrar.' },
    ],
  },
  {
    label: 'Resúmenes',
    items: [
      { kind: 'daily_close', title: 'Cierre del día', description: 'Todos los días, 21:00. Gastos de hoy y lo que vence hoy.' },
      { kind: 'weekly', title: 'Resumen del domingo', description: 'Domingos, 20:00.' },
      { kind: 'recurring', title: 'Gastos recurrentes del mes', description: 'El día 1, 06:00, cuando se generan.' },
      { kind: 'collect', title: 'Cobros del mes y atrasados', description: 'El día 1 (del mes) y el día 5 (atrasados), 09:00.' },
    ],
  },
  {
    label: 'Alertas',
    items: [
      { kind: 'budget', title: 'Presupuesto al 80 %', description: 'Al llegar al 80 % y al 100 % de una categoría.' },
      { kind: 'anomaly', title: 'Cargos raros', description: 'Precio distinto, cobro repetido o suscripción sin cargo.' },
    ],
  },
]
