import { useEffect, useState } from "react";
import { cardFromSearch } from "@/features/credit-cards/lib/card-links";
import { CreditCardDetail } from "../pages/CardDetailPage";
import { CardOverviewPage } from "../pages/CardOverviewPage";

export function CardsPage() {
  const [card, setCard] = useState<string | null | undefined>(undefined);
  useEffect(() => setCard(cardFromSearch(window.location.search)), []);
  if (card === undefined) return null;
  return card ? <CreditCardDetail cardCode={card} /> : <CardOverviewPage />;
}
