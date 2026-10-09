import { useEffect, useState } from "react";

export function CardPageSection() {
  const [section, setSection] = useState("Gastos");
  useEffect(() => {
    setSection(
      new URLSearchParams(window.location.search).has("tarjeta")
        ? "Tarjetas"
        : "Gastos",
    );
  }, []);
  return section;
}
