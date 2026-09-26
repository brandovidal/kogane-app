import { describe, expect, it } from "vitest";

import { loginUrl, safeReturnPath } from "@/shared/lib/auth-redirect";

describe("auth redirect", () => {
  it("should come back to a page of this web", () => {
    expect(safeReturnPath("/costos-fijos?mes=9")).toBe("/costos-fijos?mes=9");
    expect(safeReturnPath("/")).toBe("/");
  });

  it("should never send the browser to another site or back to the sign-in page", () => {
    for (const value of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/entrar?volver=/", null, undefined, ""]) {
      expect(safeReturnPath(value)).toBe("/");
    }
  });

  it("should send whoever has no session to sign in, remembering the page", () => {
    expect(loginUrl("/deudas?persona=p1")).toBe("/entrar?volver=%2Fdeudas%3Fpersona%3Dp1");
    expect(loginUrl("/")).toBe("/entrar");
    expect(loginUrl("https://evil.example")).toBe("/entrar");
  });
});
