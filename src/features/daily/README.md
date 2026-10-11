# Día a día

La ruta Astro `src/pages/dia-a-dia.astro` conserva `DailyExpenseTable` como punto
de entrada; este componente delega en `pages/DailyListPage`, que coordina las
secciones del listado.

- `pages/`: composición de la página y sus diálogos.
- `views/`: experiencias completas; por ahora, el calendario mensual.
- `sections/list/`: barra de vistas y resultados del listado.
- `components/`: indicadores, encabezado de período y compatibilidad con el
  nombre histórico `DailyExpenseTable`.
- `hooks/`: consultas, filtros, estado de la vista y acciones de gastos.
- `lib/`: columnas de tabla, cálculos de indicadores y utilidades del calendario.
- `constants/` y `types/`: filtros, modos de vista y contratos propios de la feature.

Los filtros, consultas de gastos, tabla base, importación, exportación y diálogos
genéricos se reutilizan desde sus features compartidas. Las importaciones internas
van directamente al archivo propietario para evitar ciclos por los índices.
