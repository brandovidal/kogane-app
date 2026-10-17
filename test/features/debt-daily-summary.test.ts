import { describe, expect, it } from "vitest";
import { summarizeDebts } from "@/features/debts/lib/debt-summary";
import {
  elapsedDays,
  summarizeDaily,
} from "@/features/daily/lib/daily-summary";
import { periodStatus } from "@/shared/lib/period-status";
import type { DailyExpense, Debt } from "@/shared/api/types";

const debt = (over: Partial<Debt>) =>
  ({
    id: "d",
    amount: 100,
    amountInPen: null,
    currency: "PEN",
    balance: 100,
    paidAmount: 0,
    timing: "upcoming",
    ...over,
  }) as Debt;

describe("period status", () => {
  const now = new Date(2026, 9, 8);
  it("tells current, billed and future months", () => {
    expect(periodStatus(10, 2026, now)).toBe("current");
    expect(periodStatus(9, 2026, now)).toBe("billed");
    expect(periodStatus(12, 2025, now)).toBe("billed");
    expect(periodStatus(11, 2026, now)).toBe("future");
  });
});

describe("summarizeDebts", () => {
  it("splits currencies and finds late balances", () => {
    const summary = summarizeDebts([
      debt({ id: "a", amount: 1950.76, balance: 1950.76 }),
      debt({ id: "b", amount: 330.57, balance: 330.57, timing: "late" }),
      debt({
        id: "c",
        amount: 15,
        balance: 15,
        currency: "USD",
        amountInPen: 56.25,
      }),
    ]);
    expect(summary.balance.PEN).toBeCloseTo(2281.33);
    expect(summary.balance.USD).toBe(15);
    expect(summary.late).toEqual({ PEN: 330.57 });
    expect(summary.lateCount).toBe(1);
    expect(summary.largest?.debt.id).toBe("a");
    expect(summary.largest?.sharePercent).toBe(86);
  });
  it("computes the paid share in soles", () => {
    const summary = summarizeDebts([
      debt({ amount: 100, paidAmount: 40, balance: 60 }),
      debt({ amount: 100, paidAmount: 0 }),
    ]);
    expect(summary.paidPercent).toBe(20);
  });
  it("handles an empty month", () => {
    const summary = summarizeDebts([]);
    expect(summary).toMatchObject({ count: 0, paidPercent: 0, largest: null });
  });
});

const expense = (over: Partial<DailyExpense>) =>
  ({
    id: "e",
    amount: 10,
    amountInPen: null,
    currency: "PEN",
    spentAt: "2026-10-01T10:00:00",
    ...over,
  }) as DailyExpense;

describe("summarizeDaily", () => {
  const now = new Date(2026, 9, 6);
  it("counts only elapsed days for the current month", () => {
    expect(elapsedDays(10, 2026, now)).toBe(6);
    expect(elapsedDays(9, 2026, now)).toBe(30);
    expect(elapsedDays(11, 2026, now)).toBe(0);
  });
  it("summarizes total, average, biggest and today", () => {
    const summary = summarizeDaily(
      [
        expense({ id: "a", amount: 14, spentAt: "2026-10-06T12:00:00" }),
        expense({ id: "b", amount: 186.4, spentAt: "2026-10-04T12:00:00" }),
        expense({
          id: "c",
          amount: 24.99,
          currency: "USD",
          amountInPen: 93.71,
        }),
      ],
      10,
      2026,
      now,
    );
    expect(summary.total).toEqual({ PEN: 200.4, USD: 24.99 });
    expect(summary.biggest?.id).toBe("b");
    expect(summary.today).toEqual({ count: 1, total: 14 });
    expect(summary.dailyAverage).toBeCloseTo((14 + 186.4 + 93.71) / 6);
  });
});
