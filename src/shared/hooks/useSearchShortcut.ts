import { useEffect, type RefObject } from "react";

export function useSearchShortcut(
  inputRef: RefObject<HTMLInputElement | null>,
  shortcut?: string,
) {
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
          (target.isContentEditable ||
            ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)))
      ) {
        return;
      }

      event.preventDefault();
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", focusOnShortcut);
    return () => window.removeEventListener("keydown", focusOnShortcut);
  }, [inputRef, shortcut]);
}
