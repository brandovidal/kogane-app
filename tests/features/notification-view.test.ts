import { describe, expect, it } from "vitest";

import { notificationLink, timeAgo } from "@/features/notifications/notification-view";

describe("notification view (P20)", () => {
  it("should open what the notice is about, or its screen", () => {
    expect(notificationLink({ kind: "due", refType: "fixed_cost" })).toBe("/costos-fijos");
    expect(notificationLink({ kind: "due", refType: "card_statement" })).toBe("/tarjetas");
    expect(notificationLink({ kind: "anomaly", refType: "daily_expense" })).toBe("/dia-a-dia");
    expect(notificationLink({ kind: "recurring", refType: null })).toBe("/recurrentes");
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
});
