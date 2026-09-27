import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { FieldLabel } from "@/shared/components/forms/FieldLabel";

export interface FormFieldProps {
  label: string;
  icon?: LucideIcon;
  missing?: boolean;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function FormField({
  label,
  icon,
  missing,
  error,
  htmlFor,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        <FieldLabel icon={icon}>
          {label}
          {missing && <span className="text-xs text-destructive">falta</span>}
        </FieldLabel>
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
