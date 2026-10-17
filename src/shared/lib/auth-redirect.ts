export function safeReturnPath(value: string | null | undefined): string {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.startsWith('/entrar') ? value : '/'
}

export function loginUrl(returnTo: string): string {
  const path = safeReturnPath(returnTo)
  return path === '/' ? '/entrar' : `/entrar?volver=${encodeURIComponent(path)}`
}
