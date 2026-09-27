import {
  Baby,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  Bus,
  Car,
  Coffee,
  Dumbbell,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Lightbulb,
  Music,
  PawPrint,
  Plane,
  ShoppingBag,
  Smartphone,
  Tags,
  Utensils,
  Wifi,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

import { cn } from "@/shared/lib/utils";

export const CATEGORY_ICON_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "home", label: "Casa", Icon: House },
  { value: "utensils", label: "Comida", Icon: Utensils },
  { value: "bus", label: "Transporte público", Icon: Bus },
  { value: "car", label: "Auto", Icon: Car },
  { value: "shopping-bag", label: "Compras", Icon: ShoppingBag },
  { value: "heart-pulse", label: "Salud", Icon: HeartPulse },
  { value: "lightbulb", label: "Servicios", Icon: Lightbulb },
  { value: "wifi", label: "Internet", Icon: Wifi },
  { value: "graduation-cap", label: "Educación", Icon: GraduationCap },
  { value: "paw-print", label: "Mascotas", Icon: PawPrint },
  { value: "gift", label: "Regalos", Icon: Gift },
  { value: "plane", label: "Viajes", Icon: Plane },
  { value: "briefcase-business", label: "Trabajo", Icon: BriefcaseBusiness },
  { value: "banknote", label: "Dinero", Icon: Banknote },
  { value: "gamepad-2", label: "Entretenimiento", Icon: Gamepad2 },
  { value: "coffee", label: "Café", Icon: Coffee },
  { value: "dumbbell", label: "Deporte", Icon: Dumbbell },
  { value: "baby", label: "Familia", Icon: Baby },
  { value: "wrench", label: "Reparaciones", Icon: Wrench },
  { value: "smartphone", label: "Tecnología", Icon: Smartphone },
  { value: "fuel", label: "Combustible", Icon: Fuel },
  { value: "music", label: "Música", Icon: Music },
  { value: "film", label: "Cine", Icon: Film },
  { value: "book-open", label: "Lectura", Icon: BookOpen },
  { value: "landmark", label: "Préstamos", Icon: Landmark },
  { value: "tag", label: "General", Icon: Tags },
];

const CATEGORY_ICONS = new Map<string, LucideIcon>([
  ...CATEGORY_ICON_OPTIONS.map(({ value, Icon }) => [value, Icon] as [string, LucideIcon]),
  ["house", House] as [string, LucideIcon],
  ["tags", Tags] as [string, LucideIcon],
]);

const sizeClasses = {
  xs: "size-5 rounded [&>svg]:size-3",
  sm: "size-6 rounded-md [&>svg]:size-3.5",
  md: "size-8 rounded-lg [&>svg]:size-4",
} as const;

export function CategoryIcon({
  icon,
  color,
  size = "sm",
  className,
}: {
  icon?: string | null;
  color?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const Icon = (icon && CATEGORY_ICONS.get(icon)) || Tags;
  const style: CSSProperties | undefined = color
    ? { color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }
    : undefined;

  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center", sizeClasses[size], className)}
      style={style}
    >
      <Icon />
    </span>
  );
}

export function CategoryLabel({
  name,
  icon,
  color,
  className,
}: {
  name: string;
  icon?: string | null;
  color?: string | null;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <CategoryIcon icon={icon} color={color} size="xs" />
      <span className="truncate">{name}</span>
    </span>
  );
}
