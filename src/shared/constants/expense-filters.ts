export const SHARED_FILTER = { SHARED: "yes", OWN: "no" } as const;

export const SHARED_FILTER_OPTIONS = [
  { value: SHARED_FILTER.SHARED, label: "Compartidos" },
  { value: SHARED_FILTER.OWN, label: "No compartidos" },
] as const;
