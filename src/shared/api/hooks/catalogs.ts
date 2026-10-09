import { useQuery } from "@tanstack/react-query";

import { useApiMutation } from "./use-api-mutation";
import {
  deleteBudgetGroup,
  deleteCategory,
  getBudgetGroups,
  getCardHolders,
  getCategories,
  getPaymentMethods,
  getPeople,
  saveBudgetGroup,
  saveCardHolders,
  saveCategory,
  savePaymentMethod,
  deactivatePaymentMethod,
  savePerson,
  type CardHoldersDto,
  type CreateBudgetGroupDto,
  type CreateCategoryDto,
  type CreatePaymentMethodDto,
  type CreatePersonDto,
} from "../services/catalog.service";

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
    queryFn: getPeople,
    staleTime: CATALOG_STALE_MS,
  });

export const usePaymentMethods = () =>
  useQuery({
    queryKey: catalogKeys.paymentMethods,
    queryFn: getPaymentMethods,
    staleTime: CATALOG_STALE_MS,
  });

export const useCategories = () =>
  useQuery({
    queryKey: catalogKeys.categories,
    queryFn: getCategories,
    staleTime: CATALOG_STALE_MS,
  });

export const useBudgetGroups = () =>
  useQuery({
    queryKey: catalogKeys.budgetGroups,
    queryFn: getBudgetGroups,
    staleTime: CATALOG_STALE_MS,
  });

export const useCreditCards = () => {
  const query = usePaymentMethods();
  return {
    ...query,
    data: query.data?.filter(
      (method) => method.type === "credit_card" && method.isActive,
    ),
  };
};

export const useSavePerson = () =>
  useApiMutation(
    (input: CreatePersonDto & { id?: string }) => savePerson(input),
    { invalidate: [catalogKeys.people], success: "Persona guardada" },
  );

export const useSavePaymentMethod = () =>
  useApiMutation(
    (input: CreatePaymentMethodDto & { id?: string }) =>
      savePaymentMethod(input),
    {
      invalidate: [catalogKeys.paymentMethods],
      success: "Medio de pago guardado",
    },
  );

export const useDeactivatePaymentMethod = () =>
  useApiMutation((id: string) => deactivatePaymentMethod(id), {
    invalidate: [catalogKeys.paymentMethods],
    success: "Tarjeta archivada",
  });

export const useSaveCategory = () =>
  useApiMutation(
    (input: CreateCategoryDto & { id?: string }) => saveCategory(input),
    { invalidate: [catalogKeys.categories], success: "Categoría guardada" },
  );

export const useDeleteCategory = () =>
  useApiMutation((id: string) => deleteCategory(id), {
    invalidate: [catalogKeys.categories],
    success: "Categoría eliminada",
  });

export const useSaveBudgetGroup = () =>
  useApiMutation(
    (input: CreateBudgetGroupDto & { id?: string }) => saveBudgetGroup(input),
    {
      invalidate: [catalogKeys.budgetGroups, ["summary"]],
      success: "Grupo guardado",
    },
  );

export const useDeleteBudgetGroup = () =>
  useApiMutation((id: string) => deleteBudgetGroup(id), {
    invalidate: [catalogKeys.budgetGroups, ["summary"]],
    success: "Grupo eliminado",
  });

// Lookup by id for tables (person and payment method names)
export const nameById = <T extends { id: string; name: string }>(
  items: T[] | undefined,
) => {
  const names = new Map((items ?? []).map((item) => [item.id, item.name]));
  return (id: string | null | undefined) => (id ? (names.get(id) ?? "—") : "—");
};

// "Yo": the default person (D19), what the Persona filter shows by default (D80)
export const useMe = () =>
  usePeople().data?.find((person) => person.isDefault)?.id;

// Titular and additional people of a credit card (D116): statements give each purchase to them
export const useCardHolders = (paymentMethodId: string | null) =>
  useQuery({
    queryKey: ["catalogs", "card-holders", paymentMethodId],
    queryFn: () => getCardHolders(paymentMethodId!),
    enabled: !!paymentMethodId,
  });

export const useSaveCardHolders = () =>
  useApiMutation(
    ({ id, holders }: { id: string; holders: CardHoldersDto["holders"] }) =>
      saveCardHolders(id, holders),
    {
      invalidate: [["catalogs", "card-holders"]],
      success: "Titular y adicionales guardados",
    },
  );
