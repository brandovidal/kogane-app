export function parseInstallment(value?: string | null) {
  const [current = "", total = ""] = (value ?? "").split("/");
  return { current, total };
}

export function installmentError(value?: string | null, required = false): string | undefined {
  if (!value) return required ? "Indica la cuota actual y el total de cuotas." : undefined;
  if (!/^\d{1,3}\/\d{1,3}$/.test(value)) return "Completa ambos campos con números enteros entre 1 y 999.";
  const { current, total } = parseInstallment(value);
  if (Number(current) < 1 || Number(total) < 1) return "Las cuotas deben ser mayores que cero.";
  if (Number(current) > Number(total)) return "La cuota actual no puede superar el total de cuotas.";
  return undefined;
}
