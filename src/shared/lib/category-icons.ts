import {
  AirVent,
  Baby,
  Banknote,
  BanknoteArrowDown,
  BanknoteArrowUp,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Bus,
  Car,
  Cloud,
  Coffee,
  Coins,
  CookingPot,
  Droplets,
  Dumbbell,
  Film,
  Flame,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HandCoins,
  Headphones,
  HeartPulse,
  House,
  Landmark,
  LandPlot,
  Laptop,
  Lightbulb,
  MonitorPlay,
  Music,
  Package,
  PawPrint,
  Percent,
  PiggyBank,
  Pill,
  Plane,
  ReceiptText,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  Smartphone,
  SquareParking,
  Stethoscope,
  Tags,
  Ticket,
  TrainFront,
  Utensils,
  WalletCards,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface CategoryIconOption {
  value: string;
  label: string;
  Icon: LucideIcon;
}

// Explicit imports keep the picker and record icons on the same Lucide catalog.
export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { value: "house", label: "Casa", Icon: House },
  { value: "building-2", label: "Alquiler y vivienda", Icon: Building2 },
  { value: "land-plot", label: "Terreno", Icon: LandPlot },
  { value: "utensils", label: "Comida", Icon: Utensils },
  { value: "shopping-basket", label: "Supermercado", Icon: ShoppingBasket },
  { value: "cooking-pot", label: "Cocina", Icon: CookingPot },
  { value: "coffee", label: "Café", Icon: Coffee },
  { value: "bus", label: "Transporte público", Icon: Bus },
  { value: "train-front", label: "Tren y metro", Icon: TrainFront },
  { value: "car", label: "Auto", Icon: Car },
  { value: "bike", label: "Bicicleta", Icon: Bike },
  { value: "square-parking", label: "Estacionamiento", Icon: SquareParking },
  { value: "fuel", label: "Combustible", Icon: Fuel },
  { value: "shopping-bag", label: "Compras", Icon: ShoppingBag },
  { value: "shirt", label: "Ropa", Icon: Shirt },
  { value: "heart-pulse", label: "Salud", Icon: HeartPulse },
  { value: "stethoscope", label: "Consultas médicas", Icon: Stethoscope },
  { value: "pill", label: "Medicamentos", Icon: Pill },
  { value: "lightbulb", label: "Servicios", Icon: Lightbulb },
  { value: "zap", label: "Electricidad", Icon: Zap },
  { value: "droplets", label: "Agua", Icon: Droplets },
  { value: "flame", label: "Gas", Icon: Flame },
  { value: "air-vent", label: "Climatización", Icon: AirVent },
  { value: "wifi", label: "Internet", Icon: Wifi },
  { value: "smartphone", label: "Celular", Icon: Smartphone },
  { value: "laptop", label: "Computadora", Icon: Laptop },
  { value: "cloud", label: "Almacenamiento en la nube", Icon: Cloud },
  { value: "graduation-cap", label: "Educación", Icon: GraduationCap },
  { value: "book-open", label: "Lectura", Icon: BookOpen },
  { value: "paw-print", label: "Mascotas", Icon: PawPrint },
  { value: "baby", label: "Familia", Icon: Baby },
  { value: "gift", label: "Regalos", Icon: Gift },
  { value: "plane", label: "Viajes", Icon: Plane },
  { value: "briefcase-business", label: "Trabajo", Icon: BriefcaseBusiness },
  { value: "banknote", label: "Dinero", Icon: Banknote },
  { value: "coins", label: "Efectivo", Icon: Coins },
  { value: "banknote-arrow-down", label: "Ingresos", Icon: BanknoteArrowDown },
  { value: "banknote-arrow-up", label: "Pagos", Icon: BanknoteArrowUp },
  { value: "landmark", label: "Préstamos", Icon: Landmark },
  { value: "hand-coins", label: "Cobros y deudas", Icon: HandCoins },
  { value: "wallet-cards", label: "Cuentas y tarjetas", Icon: WalletCards },
  { value: "piggy-bank", label: "Ahorro", Icon: PiggyBank },
  { value: "receipt-text", label: "Recibos y boletas", Icon: ReceiptText },
  { value: "percent", label: "Intereses y comisiones", Icon: Percent },
  { value: "shield-check", label: "Seguros", Icon: ShieldCheck },
  { value: "package", label: "Envíos", Icon: Package },
  { value: "gamepad-2", label: "Entretenimiento", Icon: Gamepad2 },
  { value: "monitor-play", label: "Streaming", Icon: MonitorPlay },
  { value: "headphones", label: "Audio", Icon: Headphones },
  { value: "music", label: "Música", Icon: Music },
  { value: "film", label: "Cine", Icon: Film },
  { value: "ticket", label: "Eventos", Icon: Ticket },
  { value: "dumbbell", label: "Deporte", Icon: Dumbbell },
  { value: "wrench", label: "Reparaciones", Icon: Wrench },
  { value: "tags", label: "General", Icon: Tags },
];

const aliases: Record<string, string> = { home: "house", tag: "tags" };
const categoryIcons = new Map(
  CATEGORY_ICON_OPTIONS.map(({ value, Icon }) => [value, Icon]),
);

export const normalizeCategoryIconName = (value?: string | null) =>
  value ? (aliases[value] ?? value) : null;

export function getCategoryIcon(value?: string | null): LucideIcon {
  const name = normalizeCategoryIconName(value);
  return (name && categoryIcons.get(name)) || Tags;
}

export function matchesCategoryIcon(
  option: { value: string; label: string },
  query: string,
) {
  const fold = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
  return fold(`${option.label} ${option.value}`).includes(fold(query.trim()));
}
