# Costos fijos

La ruta Astro `src/pages/costos-fijos.astro` importa `FixedCostListPage` desde el
`index.ts` de la feature. Los archivos internos se importan directamente, sin pasar
por el índice, para evitar ciclos.

- `pages/`: composición de los flujos principales. `FixedCostListPage` monta el
  listado y coordina el detalle; `FixedCostDetailPage` presenta el detalle en un
  `Sheet` dentro de ese flujo.
- `views/`: experiencias completas que el listado puede mostrar: cuotas, tablero por
  estado y mes vacío.
- `sections/list/`: resumen, toolbar, acciones masivas y resultados del listado.
- `sections/detail/`: resumen y panel de historial del registro.
- `sections/form/`: secciones generales, programación, cuotas, notas y archivos.
- `components/list/`: piezas pequeñas propias del listado, como estado vacío, tarjeta,
  nombre y vencimiento.
- `components/detail/`: filas reutilizables de información del detalle.
- `components/dialogs/`: contenedor del formulario de creación y edición.
- `hooks/`: consultas y filtros del listado, acciones del registro y ciclo de vida del formulario.
- `lib/`: reglas puras y configuración derivada, como columnas de la tabla,
  validación del formulario, filtros, cálculos de vista y exportación.
- `constants/`: valores fijos del dominio, como estados, grupos y acciones masivas.
- `types/`: contratos propios de costos fijos.

Este módulo sirve como patrón para organizar otras features: `pages` compone,
`views` presenta una experiencia completa, `sections` agrupa responsabilidades
visibles y `components` contiene piezas pequeñas. `shared` recibe una pieza solo
cuando es genérica y no depende de reglas ni componentes de una feature. Los
controles base se importan desde `src/ui`.

Las tablas, campos y fechas genéricos viven en `src/shared`. Los patrones de gastos
(filtros, acciones y transferencia) pertenecen a `features/expenses`; los archivos
pertenecen a `features/attachments`. Las secciones del formulario necesitan el
`FormProvider` que coloca `FixedCostDialog`. Las cuotas usan `InstallmentFields` de
`features/expenses`: dos entradas numéricas con `InputGroup`, guardadas en el formato
`n/m` que espera la API. La pestaña de notas permite gestionar archivos cuando el
registro ya existe.

El detalle muestra Observación completa, con saltos de línea y enlaces HTTP(S)
clicables, y una galería de adjuntos con miniaturas y visor de imágenes/PDF. El
historial puede ocultarse desde su cabecera o desde el detalle. En escritorio cada
columna tiene su propio scroll; en móvil se apilan en un sheet de ancho completo.
El botón de ampliar permite ocupar todo el ancho en escritorio. El estado del
listado usa `StatusBadge` de `features/expenses`, basado en `src/ui/badge`.
Se modifica desde el menú de acciones o el formulario de edición.

La creación desde «Nuevo gasto» conserva el flujo compartido de `new-expense` y
`drafts`.
