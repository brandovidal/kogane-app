import { describe, expect, it } from "vitest";

import { applyReplies, sanitizeBotHtml, type ChatMessage } from "@/features/messages/chat";

const summary: ChatMessage = {
  id: "m1",
  author: "bot",
  text: "Almuerzo — S/ 25.00",
  buttons: [[{ label: "✅ Guardar", data: "ok:d1" }]],
  createdAt: "2026-09-23T12:00:00Z",
};

describe("web chat", () => {
  it("should append the replies of a new message", () => {
    const next = applyReplies([], [{ text: "uno" }, { text: "dos", buttons: [[{ label: "x", data: "no:d1" }]] }]);

    expect(next.map((message) => [message.author, message.text])).toEqual([
      ["bot", "uno"],
      ["bot", "dos"],
    ]);
    expect(next[1].buttons).toEqual([[{ label: "x", data: "no:d1" }]]);
  });

  it("should replace the pressed message on edit and append the rest (✅ Guardar)", () => {
    const next = applyReplies(
      [summary],
      [{ text: "✅ <b>Guardado</b>", edit: true }, { text: "✅ Guardado: Almuerzo S/ 25.00" }],
      "m1",
    );

    expect(next).toHaveLength(2);
    expect(next[0]).toMatchObject({ id: "m1", text: "✅ <b>Guardado</b>", buttons: undefined });
    expect(next[1].text).toBe("✅ Guardado: Almuerzo S/ 25.00");
  });

  it("should append an edit when the pressed message is unknown", () => {
    expect(applyReplies([summary], [{ text: "hola", edit: true }], "missing")).toHaveLength(2);
  });

  it("should only let <b> and <i> through as HTML", () => {
    expect(sanitizeBotHtml("<b>Hola</b> <i>dany</i>\n<img src=x onerror=alert(1)>")).toBe(
      "<b>Hola</b> <i>dany</i><br>&lt;img src=x onerror=alert(1)>",
    );
  });
});
