import { describe, expect, it } from "vitest";
import {
  DEFAULT_ROW_COLOR_RULES,
  daysUntil,
  describeCondition,
  matchRowColor,
  parseRowColorRules,
  rowColorClass,
} from "@/shared/lib/row-color-rules";

const today = "2026-10-10";

describe("row color rules", () => {
  it("cuenta los días hasta el vencimiento, negativos si ya pasó", () => {
    expect(daysUntil("2026-10-13T00:00:00.000Z", today)).toBe(3);
    expect(daysUntil("2026-10-10", today)).toBe(0);
    expect(daysUntil("2026-10-08", today)).toBe(-2);
    expect(daysUntil(null, today)).toBeNull();
    expect(daysUntil("sin fecha", today)).toBeNull();
  });

  it("pinta ámbar lo que vence en 3 días o menos y rojo lo vencido", () => {
    const rules = DEFAULT_ROW_COLOR_RULES;
    expect(matchRowColor(rules, { dueDate: "2026-10-13" }, today)).toBe(
      "amber",
    );
    expect(matchRowColor(rules, { dueDate: "2026-10-10" }, today)).toBe(
      "amber",
    );
    expect(
      matchRowColor(rules, { dueDate: "2026-10-14" }, today),
    ).toBeUndefined();
    expect(matchRowColor(rules, { dueDate: "2026-10-09" }, today)).toBe("red");
  });

  it("no pinta lo ya pagado cuando la regla excluye estados terminados", () => {
    expect(
      matchRowColor(
        DEFAULT_ROW_COLOR_RULES,
        { dueDate: "2026-10-09", status: "paid" },
        today,
      ),
    ).toBeUndefined();
    expect(
      matchRowColor(
        [
          {
            id: "a",
            when: { type: "overdue" },
            skipFinished: false,
            color: "blue",
          },
        ],
        { dueDate: "2026-10-09", status: "paid" },
        today,
      ),
    ).toBe("blue");
  });

  it("gana la primera regla que coincide", () => {
    const rules = [
      {
        id: "a",
        when: { type: "within" as const, days: 10 },
        skipFinished: true,
        color: "green" as const,
      },
      ...DEFAULT_ROW_COLOR_RULES,
    ];
    expect(matchRowColor(rules, { dueDate: "2026-10-11" }, today)).toBe(
      "green",
    );
  });

  it("devuelve la clase de Tailwind de la regla o nada", () => {
    expect(
      rowColorClass(DEFAULT_ROW_COLOR_RULES, { dueDate: "2026-10-09" }, today),
    ).toContain("bg-red-500");
    expect(
      rowColorClass(DEFAULT_ROW_COLOR_RULES, { dueDate: null }, today),
    ).toBeUndefined();
  });

  it("describe cada condición en español", () => {
    expect(describeCondition({ type: "overdue" })).toBe("Vencido");
    expect(describeCondition({ type: "within", days: 0 })).toBe("Vence hoy");
    expect(describeCondition({ type: "within", days: 1 })).toBe(
      "Vence en ≤ 1 día",
    );
    expect(describeCondition({ type: "within", days: 3 })).toBe(
      "Vence en ≤ 3 días",
    );
  });

  it("lee las reglas guardadas y descarta lo inválido", () => {
    expect(parseRowColorRules(null)).toBeNull();
    expect(parseRowColorRules("{no json")).toBeNull();
    expect(parseRowColorRules('{"a":1}')).toBeNull();
    const parsed = parseRowColorRules(
      JSON.stringify([
        { id: "ok", when: { type: "within", days: 5 }, color: "red" },
        { id: "mal-color", when: { type: "overdue" }, color: "rosa" },
        { id: "mal-dias", when: { type: "within", days: -1 }, color: "red" },
        { id: "mal-dias-2", when: { type: "within", days: 500 }, color: "red" },
        { id: "mal-tipo", when: { type: "otro" }, color: "red" },
        null,
      ]),
    );
    expect(parsed).toEqual([
      {
        id: "ok",
        when: { type: "within", days: 5 },
        skipFinished: true,
        color: "red",
      },
    ]);
  });
});
