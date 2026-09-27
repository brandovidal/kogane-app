import { Fragment } from "react";
import { CircleCheck } from "lucide-react";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/ui/dropdown-menu";
import { groupPaymentStatuses } from "../lib/group-payment-statuses";
import { StatusBadge } from "./StatusBadge";

export interface PaymentStatusMenuProps {
  value: string;
  options: readonly string[];
  onChange: (status: string) => void;
}

export function PaymentStatusMenu({ value, options, onChange }: PaymentStatusMenuProps) {
  const groups = groupPaymentStatuses(options);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <CircleCheck aria-hidden="true" />
        <span className="text-muted-foreground">Estado</span>
        <StatusBadge status={value} />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-56">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {groups.map((group, index) => (
            <Fragment key={group.label}>
              {index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuGroup aria-label={group.label}>
                <DropdownMenuLabel inset className="text-xs text-muted-foreground">{group.label}</DropdownMenuLabel>
                {group.options.map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    <StatusBadge status={status} />
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuGroup>
            </Fragment>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
