import { describe, expect, it } from "vitest";

import {
  attachmentsSummary,
  kindCounts,
  uploadedLabel,
} from "@/features/attachments/lib/attachment-view";

const files = [
  { kind: "boleta", sizeBytes: 52 * 1024 },
  { kind: "boleta", sizeBytes: 1024 * 1024 },
  { kind: "recibo", sizeBytes: 212 * 1024 },
  { kind: "contrato", sizeBytes: null },
];

describe("kindCounts", () => {
  it("cuenta el total y cada tipo", () => {
    expect(kindCounts(files)).toEqual({
      all: 4,
      boleta: 2,
      recibo: 1,
      contrato: 1,
    });
  });
});

describe("attachmentsSummary", () => {
  it("resume cantidad y peso", () => {
    expect(attachmentsSummary(files)).toBe("4 archivos · 1.3 MB");
    expect(attachmentsSummary([files[0]])).toBe("1 archivo · 52 KB");
    expect(attachmentsSummary([])).toBe("0 archivos");
  });
});

describe("uploadedLabel", () => {
  const now = new Date(2026, 9, 9, 12);
  it("es relativo durante la primera semana", () => {
    expect(uploadedLabel(new Date(2026, 9, 9, 8).toISOString(), now)).toBe(
      "subido hoy",
    );
    expect(uploadedLabel(new Date(2026, 9, 8, 20).toISOString(), now)).toBe(
      "subido ayer",
    );
    expect(uploadedLabel(new Date(2026, 9, 7, 9).toISOString(), now)).toBe(
      "hace 2 días",
    );
  });
  it("luego muestra la fecha", () => {
    expect(uploadedLabel(new Date(2026, 9, 2, 14).toISOString(), now)).toBe(
      "subido el 2 oct 2026",
    );
  });
  it("tolera fechas inválidas", () => {
    expect(uploadedLabel("nope", now)).toBe("");
  });
});
