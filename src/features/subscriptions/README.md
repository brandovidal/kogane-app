# Plataformas

La ruta `/plataformas` usa `pages/PlatformListPage.tsx` como punto de composición, siguiendo la organización de Costos fijos.

- `hooks/usePlatformList.ts` carga las plataformas del período, aplica los filtros de la URL y publica el conteo del encabezado.
- `hooks/usePlatformActions.ts` reúne las acciones de cada registro y abre el editor, el detalle o el diálogo para mover la serie.
- `hooks/usePlatformTable.ts` y `hooks/usePlatformBulkActions.ts` administran columnas, selección, paginación y acciones múltiples.
- `lib/platform-summary.ts` calcula el equivalente mensual, el costo anual y las próximas fechas de cobro según la frecuencia.
- `sections/list/` contiene la barra de vistas, el resumen, los filtros, los resultados y las acciones múltiples.
- `pages/PlatformDetailPage.tsx` muestra detalle, archivos e historial del registro seleccionado.
- `views/PlatformCalendarView.tsx` muestra los cobros que corresponden al mes elegido.

La lista heredada `components/SubscriptionList.tsx` sigue sirviendo a Recurrentes; la ruta de Plataformas ya no la usa.
