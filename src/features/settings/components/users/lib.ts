export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function dateLabel(value: string | null | undefined) {
  if (!value) return 'Sin acceso'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin acceso'
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (days <= 0) return 'ahora'
  if (days === 1) return 'hace 1 día'
  if (days < 7) return `hace ${days} días`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
  }
  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export function dateRemaining(value: string) {
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return `Venció hace ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}`
  if (days === 0) return 'Vence hoy'
  return `En ${days} ${days === 1 ? 'día' : 'días'}`
}
