// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { BudgetGroup, Category } from "@/shared/api/types";

const deleteCategory = vi.fn();
const deleteBudgetGroup = vi.fn();

vi.mock("@/shared/api/hooks/catalogs", () => ({
  useSaveCategory: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteCategory: () => ({ mutate: deleteCategory, isPending: false }),
  useSaveBudgetGroup: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteBudgetGroup: () => ({ mutate: deleteBudgetGroup, isPending: false }),
  useBudgetGroups: () => ({ data: [] }),
}));
vi.mock("@/shared/hooks/useMediaQuery", () => ({ useIsDesktop: () => true }));
vi.mock("@/features/categories/components/CategoryIconPicker", () => ({
  CategoryIconPicker: () => null,
}));

import { BudgetGroupDialog } from "@/features/budget-groups/components/BudgetGroupDialog";
import { CategoryDialog } from "@/features/categories/components/CategoryDialog";

const category = {
  id: "cat-1",
  name: "Comida",
  color: "#f97316",
  icon: null,
  isDefault: false,
} as Category;
const group = {
  id: "grp-1",
  name: "Costos fijos",
  emoji: "🏠",
  percentage: 36,
  order: 1,
} as BudgetGroup;

beforeEach(() => {
  // Radix reads these in jsdom
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.scrollIntoView ??= () => {};
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Succeeds the mutation the way useApiMutation does: options carry onSuccess/onError
const succeed = (mock: ReturnType<typeof vi.fn>) =>
  mock.mockImplementation((_id: string, options?: { onSuccess?: () => void }) =>
    options?.onSuccess?.(),
  );

describe("CategoryDialog delete", () => {
  it("offers Eliminar on an editable category and asks before deleting", async () => {
    const user = userEvent.setup();
    succeed(deleteCategory);
    const onOpenChange = vi.fn();
    render(
      <CategoryDialog open onOpenChange={onOpenChange} category={category} />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(deleteCategory).not.toHaveBeenCalled();
    expect(await screen.findByText("Eliminar Comida")).toBeTruthy();

    const confirm = screen
      .getAllByRole("button", { name: "Eliminar" })
      .at(-1) as HTMLElement;
    await user.click(confirm);

    expect(deleteCategory).toHaveBeenCalledWith("cat-1", expect.any(Object));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("does not offer Eliminar on a default category or a new one", () => {
    const { rerender } = render(
      <CategoryDialog
        open
        onOpenChange={vi.fn()}
        category={{ ...category, isDefault: true }}
      />,
    );
    expect(screen.queryByRole("button", { name: "Eliminar" })).toBeNull();

    rerender(<CategoryDialog open onOpenChange={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Eliminar" })).toBeNull();
  });

  it("keeps the dialog open when the server refuses the delete", async () => {
    const user = userEvent.setup();
    deleteCategory.mockImplementation(
      (_id: string, options?: { onError?: () => void }) => options?.onError?.(),
    );
    const onOpenChange = vi.fn();
    render(
      <CategoryDialog open onOpenChange={onOpenChange} category={category} />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    await user.click(
      screen.getAllByRole("button", { name: "Eliminar" }).at(-1) as HTMLElement,
    );

    expect(deleteCategory).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

describe("BudgetGroupDialog delete", () => {
  it("offers Eliminar when editing and deletes after confirming", async () => {
    const user = userEvent.setup();
    succeed(deleteBudgetGroup);
    const onOpenChange = vi.fn();
    render(
      <BudgetGroupDialog open onOpenChange={onOpenChange} group={group} />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(deleteBudgetGroup).not.toHaveBeenCalled();
    expect(await screen.findByText("Eliminar Costos fijos")).toBeTruthy();

    await user.click(
      screen.getAllByRole("button", { name: "Eliminar" }).at(-1) as HTMLElement,
    );

    expect(deleteBudgetGroup).toHaveBeenCalledWith("grp-1", expect.any(Object));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("does not offer Eliminar on a new group", () => {
    render(<BudgetGroupDialog open onOpenChange={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Eliminar" })).toBeNull();
  });
});
