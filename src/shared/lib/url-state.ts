import { URL_STATE_CHANGE_EVENT } from "@/shared/constants/url-state";

export function readUrlValues<T extends object>(
  keys: readonly (keyof T & string)[],
  defaults: T,
): T {
  const params = new URLSearchParams(window.location.search);
  const values = { ...defaults };
  for (const key of keys) {
    if (!params.has(key)) continue;
    const value = params.get(key);
    if (value) (values as Record<string, string>)[key] = value;
    else delete values[key]; // An explicit empty value overrides a non-empty default (e.g. all months).
  }
  return values;
}

/** Each owner writes only its keys; unrelated parameters, history state and hash are preserved. */
export function replaceUrlValues<T extends object>(
  keys: readonly (keyof T & string)[],
  values: T,
  defaults: T = {} as T,
): void {
  const url = new URL(window.location.href);
  for (const key of keys) {
    const value = values[key] as string | undefined;
    if (value) url.searchParams.set(key, value);
    else if (defaults[key]) url.searchParams.set(key, "");
    else url.searchParams.delete(key);
  }
  if (url.href === window.location.href) return;
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
  window.dispatchEvent(new Event(URL_STATE_CHANGE_EVENT));
}

export function sameUrlValues<T extends object>(left: T, right: T): boolean {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...keys].every((key) =>
    Object.is(
      (left as Record<string, unknown>)[key],
      (right as Record<string, unknown>)[key],
    ),
  );
}
