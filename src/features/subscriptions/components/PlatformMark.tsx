import { cn } from "@/shared/utils/cn";

const PALETTES = [
  "bg-rose-500/20 text-rose-300",
  "bg-blue-500/20 text-blue-300",
  "bg-violet-500/20 text-violet-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-amber-500/20 text-amber-300",
] as const;

export function PlatformMark({ name, className }: { name: string; className?: string }) {
  const normalized = name.toLowerCase();
  const index = normalized.includes("netflix") ? 0
    : normalized.includes("apple") ? 1
    : normalized.includes("disney") ? 2
    : normalized.includes("hbo") ? 3
    : normalized.includes("amazon") || normalized.includes("prime") ? 4
    : [...normalized].reduce((sum, char) => sum + char.charCodeAt(0), 0) % PALETTES.length;
  return (
    <span aria-hidden="true" className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold", PALETTES[index], className)}>
      {name.trim().charAt(0).toUpperCase() || "P"}
    </span>
  );
}
