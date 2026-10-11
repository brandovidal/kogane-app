import { api, unwrap } from "@/shared/api/client";

// The password of the statement PDFs of a card (I12): the API never returns it, only hasStatementPassword
export const saveStatementPassword = (id: string, password: string | null) =>
  unwrap(
    api.PUT("/v1/payment-methods/{id}/statement-password", {
      params: { path: { id } },
      body: { password },
    }),
  );
