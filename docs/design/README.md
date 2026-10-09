# Diseño Kogane (referencia)

Boards del canvas de diseño (`boards/*.dc.html`, HTML autocontenido con tema oscuro) y su organización (`boards/canvas.json`: página → boards). Sirven de referencia visual para iterar el código; no se importan en la app.

## Mapa página del canvas → código

| Página del canvas | Boards | Feature / shared |
| --- | --- | --- |
| Login | 3 | `features/auth` |
| Inicio | 9 | `features/dashboard` |
| Menú y header | 16 | `layouts/components/navigation`, `features/notifications` |
| Mensajes | 4 | `features/messages` |
| Importación | 12 | `features/imports` |
| Borrador | 6 | `features/drafts` |
| Costos fijos | 23 | `features/fixed-costs` |
| Plataformas | 25 | `features/subscriptions` |
| Tarjetas | 21 | `features/credit-cards`, `features/statements` |
| Recurrentes | 21 | `features/recurring` |
| Cobros / Deudas / Resumen | 23 c/u | `features/debts` |
| Día a día | 25 | `features/daily` |
| Común | 19 | `shared/components` |
| Filtros | 11 | `shared/components/filters`, `shared/components/toolbar` |

## Decisiones transversales

- **Indicadores**: colapsados muestran el valor con color de estado: ámbar = pendiente, verde = completado, rojo = vencido, blanco = neutro. Componente: `IndicatorsCollapsedSummary` (prop `tone`).
- **Toolbar de listas**: Buscar · Filtros · Agrupar · columnas · ajustes · Tabla/Tarjetas. Persona vive dentro de Filtros (no hay botón aparte); los filtros aplicados se colapsan en «Ver aplicados».
- **Una sola vista**: las páginas deben caber sin scroll vertical cuando sea posible (importación, borrador).
- **Importación**: contraseñas configurables desde Configuración; formulario minimalista.
- Datos de ejemplo de los boards (filas «Solo en Kogane», estados por tarjeta, porcentajes) son provisionales.

## Cómo iterar

Abrir el board correspondiente en el navegador, comparar con la vista y ajustar el componente de su feature reutilizando `shared/`. Estructura por feature: `components`, `constants`, `hooks`, `lib`, `pages`, `sections`, `stores`, `styles`, `types`, `views`, `services`.
