import { describe, expect, it } from "vitest";
import {
  chatDayLabel,
  formatRecordingTime,
  matchCommands,
  startsNewDay,
} from "@/features/messages/lib/chat-view";

describe("chat-view", () => {
  it("filtra comandos al escribir /", () => {
    expect(matchCommands("/")).toHaveLength(5);
    expect(matchCommands("/re").map((c) => c.command)).toEqual(["/resumen"]);
    expect(matchCommands("/hoy algo")).toEqual([]);
    expect(matchCommands("almuerzo")).toEqual([]);
  });

  it("formatea el tiempo de grabación", () => {
    expect(formatRecordingTime(7.9)).toBe("0:07");
    expect(formatRecordingTime(65)).toBe("1:05");
    expect(formatRecordingTime(-3)).toBe("0:00");
  });

  it("etiqueta el día en hora de Lima", () => {
    const now = new Date("2026-10-09T15:00:00Z");
    expect(chatDayLabel("2026-10-09T14:00:00Z", now)).toBe("Hoy");
    expect(chatDayLabel("2026-10-08T14:00:00Z", now)).toBe("Ayer");
    // 02:00 UTC del 9 es 21:00 del 8 en Lima
    expect(chatDayLabel("2026-10-09T02:00:00Z", now)).toBe("Ayer");
  });

  it("detecta el cambio de día", () => {
    expect(startsNewDay(undefined, "2026-10-09T14:00:00Z")).toBe(true);
    expect(startsNewDay("2026-10-09T14:00:00Z", "2026-10-09T20:00:00Z")).toBe(
      false,
    );
    expect(startsNewDay("2026-10-08T14:00:00Z", "2026-10-09T14:00:00Z")).toBe(
      true,
    );
  });
});

import {
  formatFileSize,
  waveformBars,
} from "@/features/messages/lib/chat-view";

describe("adjuntos", () => {
  it("formatea el tamaño del archivo", () => {
    expect(formatFileSize(900)).toBe("900 B");
    expect(formatFileSize(188_416)).toBe("184 KB");
    expect(formatFileSize(2_621_440)).toBe("2.5 MB");
  });

  it("genera una onda estable por mensaje", () => {
    expect(waveformBars("a")).toEqual(waveformBars("a"));
    expect(waveformBars("a")).not.toEqual(waveformBars("b"));
    expect(waveformBars("a", 10)).toHaveLength(10);
    expect(Math.min(...waveformBars("x"))).toBeGreaterThanOrEqual(6);
  });
});
