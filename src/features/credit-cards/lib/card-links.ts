// The detail of a card is /tarjetas?tarjeta=<código> (D102): pages are static, so the card is not part of the path
export const cardHref = (code: string | null | undefined) => (code ? `/tarjetas?tarjeta=${encodeURIComponent(code)}` : "/tarjetas");

// The card asked for in the address, or null for the overview of all of them
export const cardFromSearch = (search: string) => new URLSearchParams(search).get("tarjeta") || null;
