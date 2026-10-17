import { describe, expect, it } from "vitest";

import {
  currentStep,
  detectCard,
  estimateProgress,
  fileBadge,
  MAX_UPLOAD_BYTES,
  validateUploadFile,
} from "@/features/imports/lib/upload-flow";

describe("validateUploadFile", () => {
  it("acepta PDF para estados de cuenta", () => {
    expect(
      validateUploadFile({ name: "IO.PDF", size: 1000 }, "statement"),
    ).toBeNull();
  });
  it("rechaza otros formatos", () => {
    expect(
      validateUploadFile({ name: "estado-io.docx", size: 1000 }, "statement"),
    ).toBe("Formato no compatible · usa un PDF");
  });
  it("rechaza archivos de más de 20 MB", () => {
    expect(
      validateUploadFile(
        { name: "a.pdf", size: MAX_UPLOAD_BYTES + 1 },
        "statement",
      ),
    ).toMatch(/20 MB/);
  });
  it("Notion acepta ZIP y CSV", () => {
    expect(validateUploadFile({ name: "x.zip", size: 1 }, "notion")).toBeNull();
    expect(validateUploadFile({ name: "x.csv", size: 1 }, "notion")).toBeNull();
    expect(validateUploadFile({ name: "x.pdf", size: 1 }, "notion")).toMatch(
      /Formato/,
    );
  });
});

describe("fileBadge", () => {
  it("usa la extensión", () => {
    expect(fileBadge("estado-io.docx")).toBe("DOCX");
    expect(fileBadge("sinextension")).toBe("—");
  });
});

describe("detectCard", () => {
  const cards = [
    { id: "1", name: "IO" },
    { id: "2", name: "Oh Pay" },
    { id: "3", name: "CMR Falabella" },
  ];
  it("encuentra la tarjeta por el nombre del archivo", () => {
    expect(detectCard("IO-septiembre-2026.pdf", cards)?.id).toBe("1");
    expect(detectCard("oh_pay_09.pdf", cards)?.id).toBe("2");
  });
  it("exige todas las palabras del nombre", () => {
    expect(detectCard("cmr-septiembre.pdf", cards)).toBeNull();
  });
  it("devuelve null si nada coincide", () => {
    expect(detectCard("extracto.pdf", cards)).toBeNull();
  });
});

describe("progreso estimado", () => {
  it("crece y se detiene en 90", () => {
    expect(estimateProgress(0)).toBe(0);
    expect(estimateProgress(3000)).toBeGreaterThan(30);
    expect(estimateProgress(600000)).toBe(90);
  });
  it("elige el paso según el avance", () => {
    expect([0, 40, 80].map(currentStep)).toEqual([0, 1, 2]);
  });
});
