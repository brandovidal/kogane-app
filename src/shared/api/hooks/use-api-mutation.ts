import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "../client";

// A write to kogane-api: refreshes the lists it touches and shows the error of the API (in Spanish when possible)
export function useApiMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  { invalidate, success }: { invalidate: QueryKey[]; success?: string | ((output: TOutput) => string) },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (output) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      if (success) toast.success(typeof success === "function" ? success(output) : success);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

const MESSAGES: Record<string, string> = {
  CATALOG_ITEM_IN_USE: "Está en uso: no se puede borrar.",
  CATALOG_ITEM_DUPLICATE: "Ya existe uno con ese nombre.",
  DEBT_PAYMENT_EXCEEDS_BALANCE: "El abono es mayor que el saldo.",
  EXPENSE_NOT_SAVEABLE: "Faltan datos para guardarlo.",
  EXPENSE_MOVE_BLOCKED: "No se puede mover todavía: revisa la categoría o termina la edición abierta en el bot.",
  PAYMENT_METHOD_INCOMPLETE: "A la tarjeta le faltan datos: una de crédito necesita código, cierre y pago; una de débito, su banco.",
  API_KEY_REQUIRED: "La web no tiene la API key configurada.",
  API_KEY_INVALID: "La API key de la web no coincide con la de kogane-api.",
};

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return MESSAGES[error.code] ?? error.message;
  return "No se pudo conectar con kogane-api.";
}
