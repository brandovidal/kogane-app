// Where the sign-in page sends the browser back to: only a path of this web, never another site (an open redirect)
export function safeReturnPath(value: string | null | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !value.startsWith("/entrar") ? value : "/";
}

// The sign-in page, remembering where the person was going
export function loginUrl(returnTo: string): string {
  const path = safeReturnPath(returnTo);
  return path === "/" ? "/entrar" : `/entrar?volver=${encodeURIComponent(path)}`;
}
