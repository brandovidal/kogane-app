import { useInitials } from "@/shared/hooks/useInitials";

export interface NameAvatarProps {
  name: string;
  initials?: string;
  unassigned?: boolean;
}

export function NameAvatar({
  name,
  initials: customInitials,
  unassigned = false,
}: NameAvatarProps) {
  const generatedInitials = useInitials(name);

  return (
    <span
      aria-hidden="true"
      className={
        unassigned
          ? "inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/60 text-[10px] text-muted-foreground"
          : "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
      }
    >
      {unassigned ? "?" : (customInitials ?? generatedInitials)}
    </span>
  );
}
