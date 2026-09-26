import { useEffect, useState } from "react";

import { cardFromSearch } from "@/shared/lib/card-links";

import { CreditCardDetail } from "./CreditCardDetail";
import { CreditCardOverview } from "./CreditCardOverview";

// Tarjetas: the overview of every card, or the detail of one with ?tarjeta=IO (D97, D102). The address is read in the
// browser (the page is static), so nothing is drawn until it is known
export function CardsPage() {
  const [card, setCard] = useState<string | null | undefined>(undefined);
  useEffect(() => setCard(cardFromSearch(window.location.search)), []);

  if (card === undefined) return null;
  return card ? <CreditCardDetail cardCode={card} /> : <CreditCardOverview />;
}
