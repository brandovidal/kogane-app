import { useEffect, useState } from "react";
import { useCardHeader } from "../../stores/card-header.store";

export function CardRecordCount({
  singular = "tarjeta",
  plural = "tarjetas",
}: {
  singular?: string;
  plural?: string;
}) {
  const count = useCardHeader((state) => state.count);
  const [isDetail, setIsDetail] = useState(false);
  useEffect(() => {
    setIsDetail(!!new URLSearchParams(window.location.search).get("tarjeta"));
  }, []);
  if (count == null) return null;
  return (
    <span
      className="whitespace-nowrap text-sm font-medium tabular-nums text-muted-foreground"
      aria-live="polite"
    >
      {count}{" "}
      {count === 1
        ? isDetail
          ? "movimiento"
          : singular
        : isDetail
          ? "movimientos"
          : plural}
    </span>
  );
}
