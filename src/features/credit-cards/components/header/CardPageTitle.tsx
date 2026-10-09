import { useCardHeader } from "../../stores/card-header.store";

export function CardPageTitle({ fallback }: { fallback: string }) {
  const title = useCardHeader((state) => state.title);
  return title ?? fallback;
}
