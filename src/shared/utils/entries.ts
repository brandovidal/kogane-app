export const entriesOf = (labels: Record<string, string>, keys?: string[]) =>
  (keys ?? Object.keys(labels)).map((key) => ({
    value: key,
    label: labels[key] ?? key,
  }));
