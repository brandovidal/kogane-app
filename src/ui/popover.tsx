"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/shared/utils/cn";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverPortal = PopoverPrimitive.Portal;
const PopoverPositioner = PopoverPrimitive.Positioner;

function PopoverContent({
  className,
  sideOffset = 4,
  align = "start",
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> & {
  sideOffset?: number;
  align?: "start" | "center" | "end";
}) {
  return (
    <PopoverPortal>
      <PopoverPositioner sideOffset={sideOffset} align={align} className="z-50">
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn("rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none", className)}
          {...props}
        />
      </PopoverPositioner>
    </PopoverPortal>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
