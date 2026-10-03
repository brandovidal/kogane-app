# Imports / Importación

Organización equivalente a `fixed-costs`:

- `components/ImportsPage.tsx`: export de compatibilidad.
- `views/ImportsPageView.tsx`: composición y entrada `ImportsPage` con `withQuery`, usada directamente desde `pages/importacion.astro`.
- `components/`: formulario de carga, historial con confirmación, estado de fila y previsualización de tarjeta.
- `views/NotionImportDetailView.tsx`: composición del detalle de Notion.
- `sections/`: pestañas de filas y resumen mensual.
- `hooks/imports.ts`: consultas y mutaciones de la API.
- `hooks/useImportUpload.ts`: formulario, validación de tarjeta, contraseña y envío.
- `hooks/useImportHistoryActions.ts`: confirmación y eliminación del historial.
- `hooks/useImportRowsTab.ts`: búsqueda, estado y paginación desde la API.
- `hooks/useNotionImportDetail.ts`: carga y acciones de Notion.
- `hooks/useImportsPage.ts`: historial combinado y selección vigente.
- `constants/`: etiquetas, estados, orden de pestañas y claves de consultas.
- `types/`: contratos del historial, parámetros de consulta y props.
- `lib/`: funciones puras del historial, filas y resumen.

Cada carpeta tiene su `index.ts`; el `index.ts` de la feature publica componentes,
hooks, constantes, tipos y utilidades. Los módulos internos importan archivos
concretos para evitar ciclos. El detalle de tarjetas pertenece a `statements` y
se reutiliza desde `StatementPreview`.

La separación conserva el flujo de carga y aprobación, los mensajes de validación,
la confirmación de eliminación y la presentación de filas para escritorio y móvil.
