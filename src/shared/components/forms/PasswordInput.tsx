import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/shared/utils/cn";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

export interface PasswordInputProps extends Omit<
  ComponentProps<typeof Input>,
  "type"
> {
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

/** Password input with an accessible control to reveal or mask its value. */
export function PasswordInput({
  className,
  visible,
  defaultVisible = false,
  onVisibleChange,
  disabled,
  ...props
}: PasswordInputProps) {
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const isVisible = visible ?? internalVisible;

  const toggleVisibility = () => {
    const next = !isVisible;
    if (visible === undefined) setInternalVisible(next);
    onVisibleChange?.(next);
  };

  return (
    <div className="relative w-full min-w-0">
      <Input
        {...props}
        type={isVisible ? "text" : "password"}
        disabled={disabled}
        className={cn("pr-10", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={isVisible}
        onClick={toggleVisibility}
        disabled={disabled}
      >
        {isVisible ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </Button>
    </div>
  );
}
