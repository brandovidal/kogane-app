import { useQuery } from "@tanstack/react-query";

import { api, unwrap, type Schemas } from "../client";
import { useApiMutation } from "./use-api-mutation";

// Catalogs change little: long stale time, refreshed after every write
const CATALOG_STALE_MS = 5 * 60_000;

export const catalogKeys = {
  people: ["catalogs", "people"] as const,
  paymentMethods: ["catalogs", "payment-methods"] as const,
  categories: ["catalogs", "categories"] as const,
  budgetGroups: ["catalogs", "budget-groups"] as const,
};

export const usePeople = () =>
  useQuery({
    queryKey: catalogKeys.people,
    queryFn: () => unwrap(api.GET("/v1/people")),
    staleTime: CATALOG_STALE_MS,
  });

export const usePaymentMethods = () =>
  useQuery({
    queryKey: catalogKeys.paymentMethods,
    queryFn: () => unwrap(api.GET("/v1/payment-methods")),
    staleTime: CATALOG_STALE_MS,
  });

export const useCategories = () =>
  useQuery({
    queryKey: catalogKeys.categories,
    queryFn: () => unwrap(api.GET("/v1/categories")),
    staleTime: CATALOG_STALE_MS,
  });

export const useBudgetGroups = () =>
  useQuery({
    queryKey: catalogKeys.budgetGroups,
    queryFn: () => unwrap(api.GET("/v1/budget-groups")),
    staleTime: CATALOG_STALE_MS,
  });

// Credit cards are payment methods of type credit_card (D62); only the ones you have (isActive, Configuración ▸
// Cuentas y tarjetas) show in the menu and the pages
export const useCreditCards = () => {
  const query = usePaymentMethods();
  return { ...query, data: query.data?.filter((method) => method.type === "credit_card" && method.isActive) };
};

export const useSavePerson = () =>
  useApiMutation(
    ({ id, ...body }: Schemas["CreatePersonDto"] & { id?: string }) =>
      id
        ? unwrap(api.PATCH("/v1/people/{id}", { params: { path: { id } }, body }))
        : unwrap(api.POST("/v1/people", { body })),
    { invalidate: [catalogKeys.people], success: "Persona guardada" },
  );

export const useSavePaymentMethod = () =>
  useApiMutation(
    ({ id, ...body }: Schemas["CreatePaymentMethodDto"] & { id?: string }) =>
      id
        ? unwrap(api.PATCH("/v1/payment-methods/{id}", { params: { path: { id } }, body }))
        : unwrap(api.POST("/v1/payment-methods", { body })),
    { invalidate: [catalogKeys.paymentMethods], success: "Medio de pago guardado" },
  );

export const useSaveCategory = () =>
  useApiMutation(
    ({ id, ...body }: Schemas["CreateCategoryDto"] & { id?: string }) =>
      id
        ? unwrap(api.PATCH("/v1/categories/{id}", { params: { path: { id } }, body }))
        : unwrap(api.POST("/v1/categories", { body })),
    { invalidate: [catalogKeys.categories], success: "Categoría guardada" },
  );

export const useDeleteCategory = () =>
  useApiMutation((id: string) => unwrap(api.DELETE("/v1/categories/{id}", { params: { path: { id } } })), {
    invalidate: [catalogKeys.categories],
    success: "Categoría eliminada",
  });

export const useSaveBudgetGroup = () =>
  useApiMutation(
    ({ id, ...body }: Schemas["CreateBudgetGroupDto"] & { id?: string }) =>
      id
        ? unwrap(api.PATCH("/v1/budget-groups/{id}", { params: { path: { id } }, body }))
        : unwrap(api.POST("/v1/budget-groups", { body })),
    { invalidate: [catalogKeys.budgetGroups, ["summary"]], success: "Grupo guardado" },
  );

export const useDeleteBudgetGroup = () =>
  useApiMutation((id: string) => unwrap(api.DELETE("/v1/budget-groups/{id}", { params: { path: { id } } })), {
    invalidate: [catalogKeys.budgetGroups, ["summary"]],
    success: "Grupo eliminado",
  });

// Lookup by id for tables (person and payment method names)
export const nameById = <T extends { id: string; name: string }>(items: T[] | undefined) => {
  const names = new Map((items ?? []).map((item) => [item.id, item.name]));
  return (id: string | null | undefined) => (id ? (names.get(id) ?? "—") : "—");
};

// "Yo": the default person (D19), what the Persona filter shows by default (D80)
export const useMe = () => usePeople().data?.find((person) => person.isDefault)?.id;

// Titular and additional people of a credit card (D116): statements give each purchase to them
export const useCardHolders = (paymentMethodId: string | null) =>
  useQuery({
    queryKey: ["catalogs", "card-holders", paymentMethodId],
    queryFn: () =>
      unwrap(api.GET("/v1/payment-methods/{id}/holders", { params: { path: { id: paymentMethodId! } } })),
    enabled: !!paymentMethodId,
  });

export const useSaveCardHolders = () =>
  useApiMutation(
    ({ id, holders }: { id: string; holders: Schemas["CardHoldersDto"]["holders"] }) =>
      unwrap(api.PUT("/v1/payment-methods/{id}/holders", { params: { path: { id } }, body: { holders } })),
    { invalidate: [["catalogs", "card-holders"]], success: "Titular y adicionales guardados" },
  );
