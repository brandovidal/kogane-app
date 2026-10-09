import {
  Banknote,
  CreditCard,
  Landmark,
  Smartphone,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import type { PaymentMethod } from "@/shared/api/types";

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod["type"], LucideIcon> = {
  credit_card: CreditCard,
  debit_card: WalletCards,
  wallet: Smartphone,
  cash: Banknote,
  bank_transfer: Landmark,
};

export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethod["type"], string> =
  {
    credit_card: "Tarjeta de crédito",
    debit_card: "Débito",
    wallet: "Billetera",
    cash: "Efectivo",
    bank_transfer: "Transferencia",
  };
