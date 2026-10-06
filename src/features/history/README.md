# Historial

El historial del registro y el historial general comparten la misma presentación.

- `HistoryDialog`: consulta del registro, errores, filtros y carga paginada de cambios anteriores.
- `HistoryTimeline`: agrupación por fecha y separadores con el componente base `ui/marker`.
- `HistoryTimelineItem`: acción, hora, origen y contenido de cada evento.
- `HistoryChanges`: resumen de creación/eliminación y comparación de ediciones.
- `HistoryValue`: valores históricos y badges para los estados de pago.
- `HistoryTimelineLoading`: indicador accesible con shimmer y esqueletos.
- `lib/history-timeline`: orden descendente y fechas en `America/Lima`.
- `lib/history-view`: etiquetas de campos y formato de valores.
- `constants/history-ui`: iconos Lucide, estilos de acciones y cantidad visible inicial.
- `types/history-timeline`: contratos de la línea de tiempo.

Los datos proceden de la API del historial; los eventos no se reconstruyen a partir del estado actual del registro. El historial del detalle permite filtrar ediciones, cambios de estado y notas/archivos. Se carga por páginas y mantiene el total disponible; todas las fechas y horas usan `America/Lima`.

`ui/marker` proviene del registro Base UI de shadcn. La utilidad oficial shimmer se mantiene en `styles/shimmer.css`, importada por `globals.css`, y respeta la preferencia de movimiento reducido.
