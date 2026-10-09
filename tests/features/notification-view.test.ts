import { describe, expect, it } from "vitest";

import {
  dayGroup,
  filterByTab,
  groupByDay,
  noticeTime,
  notificationLink,
  timeAgo,
} from "@/features/notifications/lib/notification-view";

describe("notification view (P20)", () => {
  it("should open what the notice is about, or its screen", () => {
    expect(notificationLink({ kind: "due", refType: "fixed_cost" })).toBe(
      "/costos-fijos",
    );
    expect(notificationLink({ kind: "due", refType: "card_statement" })).toBe(
      "/tarjetas",
    );
    expect(
      notificationLink({ kind: "anomaly", refType: "daily_expense" }),
    ).toBe("/dia-a-dia");
    expect(notificationLink({ kind: "recurring", refType: null })).toBe(
      "/recurrentes",
    );
    expect(notificationLink({ kind: "weekly", refType: null })).toBe("/");
  });

  it("should say how long ago it arrived", () => {
    const now = new Date("2026-09-24T21:00:00Z");

    expect(timeAgo("2026-09-24T20:59:40Z", now)).toBe("ahora");
    expect(timeAgo("2026-09-24T20:45:00Z", now)).toBe("hace 15 min");
    expect(timeAgo("2026-09-24T18:00:00Z", now)).toBe("hace 3 h");
    expect(timeAgo("2026-09-23T20:00:00Z", now)).toBe("ayer");
    expect(timeAgo("2026-09-20T21:00:00Z", now)).toBe("hace 4 días");
    expect(timeAgo("2026-09-01T21:00:00Z", now)).toBe("01/09");
  });

  describe("bell tabs and day groups", () => {
    // 2026-10-09 10:00 in Lima
    const now = new Date("2026-10-09T15:00:00Z");
    const items = [
      { id: "a", kind: "due", readAt: null, createdAt: "2026-10-09T14:12:00Z" },
      {
        id: "b",
        kind: "weekly",
        readAt: "2026-10-09T14:30:00Z",
        createdAt: "2026-10-09T13:00:00Z",
      },
      {
        id: "c",
        kind: "collect",
        readAt: null,
        createdAt: "2026-10-08T23:20:00Z",
      },
      {
        id: "d",
        kind: "budget",
        readAt: "2026-10-08T20:00:00Z",
        createdAt: "2026-10-05T16:00:00Z",
      },
    ] as const;

    it("should filter by tab", () => {
      expect(filterByTab([...items], "all")).toHaveLength(4);
      expect(filterByTab([...items], "unread").map((i) => i.id)).toEqual([
        "a",
        "c",
      ]);
      expect(filterByTab([...items], "due").map((i) => i.id)).toEqual([
        "a",
        "c",
      ]);
    });

    it("should place each notice on its day in Lima", () => {
      expect(dayGroup(items[0].createdAt, now)).toBe("Hoy");
      expect(dayGroup(items[2].createdAt, now)).toBe("Ayer");
      expect(dayGroup(items[3].createdAt, now)).toBe("Antes");
    });

    it("should group in order and skip empty groups", () => {
      const groups = groupByDay([...items], now);

      expect(groups.map((g) => [g.label, g.items.length])).toEqual([
        ["Hoy", 2],
        ["Ayer", 1],
        ["Antes", 1],
      ]);
      expect(groupByDay([items[0]], now).map((g) => g.label)).toEqual(["Hoy"]);
    });

    it("should show the clock of recent notices and the age of older ones", () => {
      expect(noticeTime("2026-10-09T14:12:00Z", now)).toBe("9:12");
      expect(noticeTime("2026-10-05T16:00:00Z", now)).toBe("hace 4 días");
    });
  });
});
