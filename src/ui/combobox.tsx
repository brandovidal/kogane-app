"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";

import { cn } from "@/shared/lib/utils";

const Combobox = ComboboxPrimitive.Root;
const createComboboxItems = ComboboxPrimitive.createItems;
const ComboboxValue = ComboboxPrimitive.Value;
const ComboboxList = ComboboxPrimitive.List;
const ComboboxEmpty = ComboboxPrimitive.Empty;
const ComboboxItemIndicator = ComboboxPrimitive.ItemIndicator;

const ComboboxTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof ComboboxPrimitive.Trigger>
>(({ className, type = "button", ...props }, ref) => (
  <ComboboxPrimitive.Trigger
    ref={ref}
    type={type}
    data-slot="combobox-trigger"
    className={cn(
      "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30",
      className,
    )}
    {...props}
  />
));
ComboboxTrigger.displayName = "ComboboxTrigger";

const ComboboxContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ComboboxPrimitive.Popup> & {
    sideOffset?: number;
  }
>(({ className, sideOffset = 4, ...props }, ref) => (
  <ComboboxPrimitive.Portal>
    <ComboboxPrimitive.Positioner sideOffset={sideOffset} className="z-50">
      <ComboboxPrimitive.Popup
        ref={ref}
        data-slot="combobox-content"
        className={cn(
          "w-[var(--anchor-width)] min-w-40 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
          className,
        )}
        {...props}
      />
    </ComboboxPrimitive.Positioner>
  </ComboboxPrimitive.Portal>
));
ComboboxContent.displayName = "ComboboxContent";

const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof ComboboxPrimitive.Input>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Input
    ref={ref}
    data-slot="combobox-input"
    className={cn(
      "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
      className,
    )}
    {...props}
  />
));
ComboboxInput.displayName = "ComboboxInput";

const ComboboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ComboboxPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Item
    ref={ref}
    data-slot="combobox-item"
    className={cn(
      "group flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  />
));
ComboboxItem.displayName = "ComboboxItem";

export {
  Combobox,
  createComboboxItems,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
};
