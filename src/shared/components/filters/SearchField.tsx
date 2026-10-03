import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { Input } from "@/ui/input";

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  className?: string;
  labelClassName?: string;
  active?: boolean;
  shortcut?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  className,
  labelClassName = "text-xs font-medium text-muted-foreground",
  active = value.trim().length > 0,
  shortcut,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shortcut !== "/") return;
    const focusOnShortcut = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        event.key !== "/" ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        document.querySelector('[role="dialog"], [role="alertdialog"]') ||
        (target instanceof HTMLElement &&
          (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)))
      ) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", focusOnShortcut);
    return () => window.removeEventListener("keydown", focusOnShortcut);
  }, [shortcut]);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <div className={labelClassName}>{label}</div>}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${active ? "text-primary" : "text-muted-foreground"}`} />
        <Input
          ref={inputRef}
          aria-label={label ?? placeholder}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-9 pl-9 ${shortcut ? "pr-9 " : ""}${active ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20" : ""}`}
        />
        {shortcut && (
          <kbd
            aria-hidden="true"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded border px-1 text-[10px] leading-4 text-muted-foreground"
          >
            {shortcut}
          </kbd>
        )}
      </div>
    </div>
  );
}
