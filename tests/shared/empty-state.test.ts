import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/shared/components/data-display/EmptyState";

describe("EmptyState", () => {
  it("muestra título, descripción, contenido y acción", () => {
    const html = renderToStaticMarkup(
      createElement(
        EmptyState,
        {
          variant: "filters",
          title: "Ningún costo coincide",
          description: "Prueba con otros filtros",
          action: createElement("button", null, "Limpiar filtros"),
        },
        createElement("span", null, "chip"),
      ),
    );
    expect(html).toContain("Ningún costo coincide");
    expect(html).toContain("Prueba con otros filtros");
    expect(html).toContain("chip");
    expect(html).toContain("Limpiar filtros");
    expect(html).toContain('data-variant="filters"');
  });

  it("la variante search no dibuja el icono", () => {
    const html = renderToStaticMarkup(
      createElement(EmptyState, { variant: "search", title: "Sin resultados" }),
    );
    expect(html).not.toContain("<svg");
  });

  it("period y filters dibujan la insignia de esquina", () => {
    const html = renderToStaticMarkup(
      createElement(EmptyState, { variant: "period" }),
    );
    expect(html.match(/<svg/g)?.length).toBe(2);
  });
});
