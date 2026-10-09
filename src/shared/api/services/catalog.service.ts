import { api, unwrap } from "../client";
import type {
  CardHoldersDto,
  CreateBudgetGroupDto,
  CreateCategoryDto,
  CreatePaymentMethodDto,
  CreatePersonDto,
} from "../types/catalog.dto";
export type {
  CardHoldersDto,
  CreateBudgetGroupDto,
  CreateCategoryDto,
  CreatePaymentMethodDto,
  CreatePersonDto,
} from "../types/catalog.dto";

export const getPeople = () => unwrap(api.GET("/v1/people"));
export const getPaymentMethods = () => unwrap(api.GET("/v1/payment-methods"));
export const getCategories = () => unwrap(api.GET("/v1/categories"));
export const getBudgetGroups = () => unwrap(api.GET("/v1/budget-groups"));

export const savePerson = ({
  id,
  ...body
}: CreatePersonDto & { id?: string }) =>
  id
    ? unwrap(api.PATCH("/v1/people/{id}", { params: { path: { id } }, body }))
    : unwrap(api.POST("/v1/people", { body }));

export const savePaymentMethod = ({
  id,
  ...body
}: CreatePaymentMethodDto & { id?: string }) =>
  id
    ? unwrap(
        api.PATCH("/v1/payment-methods/{id}", {
          params: { path: { id } },
          body,
        }),
      )
    : unwrap(api.POST("/v1/payment-methods", { body }));

export const saveCategory = ({
  id,
  ...body
}: CreateCategoryDto & { id?: string }) =>
  id
    ? unwrap(
        api.PATCH("/v1/categories/{id}", { params: { path: { id } }, body }),
      )
    : unwrap(api.POST("/v1/categories", { body }));

export const deleteCategory = (id: string) =>
  unwrap(api.DELETE("/v1/categories/{id}", { params: { path: { id } } }));

export const saveBudgetGroup = ({
  id,
  ...body
}: CreateBudgetGroupDto & { id?: string }) =>
  id
    ? unwrap(
        api.PATCH("/v1/budget-groups/{id}", { params: { path: { id } }, body }),
      )
    : unwrap(api.POST("/v1/budget-groups", { body }));

export const deleteBudgetGroup = (id: string) =>
  unwrap(api.DELETE("/v1/budget-groups/{id}", { params: { path: { id } } }));

export const getCardHolders = (id: string) =>
  unwrap(
    api.GET("/v1/payment-methods/{id}/holders", { params: { path: { id } } }),
  );

export const saveCardHolders = (
  id: string,
  holders: CardHoldersDto["holders"],
) =>
  unwrap(
    api.PUT("/v1/payment-methods/{id}/holders", {
      params: { path: { id } },
      body: { holders },
    }),
  );
