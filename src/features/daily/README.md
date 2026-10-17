# Día a día

La ruta Astro `src/pages/dia-a-dia.astro` usa `pages/DailyListPage` como punto de
entrada, que coordina las secciones del listado.

- `pages/`: composición de la página y sus diálogos.
- `views/`: experiencias completas; por ahora, el calendario mensual.
- `sections/list/`: barra de vistas y resultados del listado.
- `components/`: indicadores y encabezado de período.
- `hooks/`: consultas, filtros, estado de la vista y acciones de gastos.
- `lib/`: columnas de tabla, cálculos de indicadores y utilidades del calendario.
- `constants/` y `types/`: filtros, modos de vista y contratos propios de la feature.

Los filtros, consultas de gastos, tabla base, importación, exportación y diálogos
genéricos se reutilizan desde sus features compartidas. Las importaciones internas
van directamente al archivo propietario para evitar ciclos por los índices.
