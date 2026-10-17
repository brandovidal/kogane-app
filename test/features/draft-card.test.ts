import { describe, expect, it } from "vitest";
import {
  actionRole,
  buttonText,
  parseDraftCard,
} from "@/features/messages/lib/draft-card";

const now = new Date("2026-10-09T15:00:00Z");

describe("draft card", () => {
  it("lee el resumen de un borrador", () => {
    const card = parseDraftCard(
      "🧾 <b>Almuerzo</b> — S/ 25.00\n👤 Brando 💳 Yape 📂 Comida\n📅 09/10/2026 · Día a día · Esencial",
      now,
    );
    expect(card).toMatchObject({
      title: "Almuerzo",
      amount: "S/ 25.00",
      before: "",
      after: "",
    });
    expect(card?.tags).toEqual([
      "Día a día",
      "Yape",
      "Brando",
      "Comida",
      "Hoy",
    ]);
  });

  it("omite campos vacíos y conserva el texto de alrededor", () => {
    const card = parseDraftCard(
      "🎙️ Entendí: <i>«almuerzo»</i>\n\n🧾 <b>Almuerzo</b> — S/ 17.00\n👤 Brando ❓ 💳 — 📂 Comida\n📅 26/09/2026 · Día a día\n\n¿Con qué pagaste?",
      now,
    );
    expect(card?.tags).toEqual(["Día a día", "Brando", "Comida", "26/09/2026"]);
    expect(card?.before).toContain("Entendí");
    expect(card?.after).toBe("¿Con qué pagaste?");
  });

  it("devuelve null si no es un borrador", () => {
    expect(parseDraftCard("Hola")).toBeNull();
  });

  it("clasifica los botones", () => {
    expect(actionRole("✅ Guardar")).toBe("save");
    expect(actionRole("❌ Descartar")).toBe("discard");
    expect(actionRole("Yape")).toBeNull();
    expect(buttonText("✏️ Editar")).toBe("Editar");
  });
});
