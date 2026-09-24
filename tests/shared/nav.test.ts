import { describe, expect, it } from "vitest";

import { NAV, flattenNav, isActivePath } from "@/shared/constants";

describe("menu", () => {
  it("should start with Inicio and the Registrar group (D80)", () => {
    expect(NAV.slice(0, 2).map((entry) => entry.label)).toEqual(["Inicio", "Registrar"]);
    const links = flattenNav(NAV);
    expect(links.filter((link) => link.group === "Registrar").map((link) => link.label)).toEqual([
      "Mensajes",
      "Reconocimiento",
      "Borrador",
    ]);
    expect(links.map((link) => link.href)).toContain("/ingresos");
  });

  it("should list every link with the cards under Tarjetas", () => {
    const links = flattenNav(NAV, [{ href: "/tarjetas/IO", label: "IO" }]);
    const hrefs = links.map((link) => link.href);

    expect(hrefs.indexOf("/tarjetas/IO")).toBe(hrefs.indexOf("/tarjetas") + 1);
    expect(links.find((link) => link.href === "/tarjetas/IO")?.group).toBe("Gastos");
    expect(hrefs.at(-1)).toBe("/configuracion");
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("should mark the section of nested pages and only the exact home", () => {
    expect(isActivePath("/tarjetas", "/tarjetas/IO")).toBe(true);
    expect(isActivePath("/", "/tarjetas")).toBe(false);
    expect(isActivePath("/", "/")).toBe(true);
  });
});
