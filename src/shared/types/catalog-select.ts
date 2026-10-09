import type { ComponentProps, ReactNode } from "react";

export interface CatalogSelectProps extends Pick<
  ComponentProps<"button">,
  "id" | "aria-label" | "aria-required" | "aria-invalid" | "aria-describedby"
> {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  placeholder?: string;
  allowEmpty?: boolean; // adds "—" to clear an optional field
  className?: string;
  disabled?: boolean;
}

export interface CatalogOption {
  id: string;
  name: string;
  content?: ReactNode;
  group?: string;
}
