import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import { catalogKeys } from "@/shared/api/hooks/catalogs";
import { saveStatementPassword } from "../services/statement-password.service";

export const useSaveStatementPassword = () =>
  useApiMutation(
    (input: { id: string; password: string | null }) =>
      saveStatementPassword(input.id, input.password),
    {
      invalidate: [catalogKeys.paymentMethods],
      success: "Contraseña del estado de cuenta actualizada",
    },
  );
