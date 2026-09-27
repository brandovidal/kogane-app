# Costos fijos

La página de Astro importa `FixedCostListPage` desde el `index.ts` de la feature.
Los archivos internos se importan directamente, sin pasar por el índice, para evitar ciclos.

- `views/`: composición del listado y del detalle. `FixedCostListPage` agrega el proveedor de consultas.
- `sections/`: controles del listado, resultados, columnas, resumen del detalle y pestañas del formulario.
- `components/`: piezas pequeñas del registro (nombre y fila del detalle).
- `components/dialogs/`: contenedor del formulario de creación y edición.
- `hooks/`: consultas y filtros del listado, acciones del registro y ciclo de vida del formulario.
- `lib/fixed-cost-form.ts`: validación, valores iniciales y transformación del cuerpo para guardar.
- `lib/fixed-cost-filters.ts`: campos y opciones de agrupación.
- `lib/fixed-cost-export.ts`: preparación de los datos de exportación.
- `types/fixed-cost-types.ts`: contratos de acciones y agrupación.
- `constants/statuses.ts`: estados admitidos para costos fijos.

Los controles base se importan desde `src/ui`. Las tablas, campos y fechas genéricos
viven en `src/shared`. Los patrones de gastos (filtros, acciones y transferencia)
pertenecen a `features/expenses`; los archivos pertenecen a `features/attachments`.
Las secciones del formulario necesitan el `FormProvider` que coloca `FixedCostDialog`.
Las cuotas usan `InstallmentFields` de `features/expenses`: dos entradas numéricas
con `InputGroup`, guardadas en el formato `n/m` que espera la API.
La pestaña de notas permite gestionar archivos cuando el registro ya existe.
El detalle muestra Observación completa, con saltos de línea y enlaces HTTP(S)
clicables, y una galería de adjuntos con miniaturas y visor de imágenes/PDF.
El historial puede ocultarse desde su cabecera o desde el detalle. En escritorio
cada columna tiene su propio scroll; en móvil se apilan en un sheet de ancho
completo. El botón de ampliar permite ocupar todo el ancho en escritorio.
El estado del listado usa `StatusBadge` de `features/expenses`, basado en `src/ui/badge`.
Se modifica desde el menú de acciones o el formulario de edición.

La creación desde «Nuevo gasto» conserva el flujo compartido de `new-expense` y `drafts`.
