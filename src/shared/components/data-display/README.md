# Tablas compartidas

La base sigue el patrón de [shadcn Data Table](https://ui.shadcn.com/docs/components/base/data-table) con TanStack Table v8 y los componentes de `src/ui`.

- `DataTableBasic`: renderiza filas, columnas visibles, selección, ordenación, carga, error y estado vacío.
- `DataTableComplex`: compone la misma tabla con barra opcional y paginación.
- `DataTableColumnSelector`: control compacto para colocar junto al modo de vista. Respeta `enableHiding`.
- `DataTablePagination`: controla página y tamaño usando la instancia de tabla.
- `useDataTable`: estado local o controlado; IDs estables mediante `rowKey`.
- `toDataTableColumns`: adapta las definiciones `Column<T>` compartidas por tabla y tarjetas. Las celdas siguen perteneciendo a cada feature.
- `DataViewTable`: adaptador sin paginación para las vistas existentes. No cambia sus llamadas públicas.

## Estado actual de costos fijos

El endpoint existente devuelve un listado por periodo. Mes y Año están dentro del sheet de filtros, con opción «Todos»; si ambos están seleccionados se envían a la API. Si falta uno o ambos, se consulta el listado completo y se aplica la restricción restante localmente. La búsqueda, los demás filtros y la paginación se aplican localmente. El rango de vencimiento se combina con el período seleccionado. Exportación y totales usan todo el resultado filtrado, mientras la selección del encabezado abarca únicamente la página visible. Se conservan las selecciones al cambiar de página o modo de vista; cambiar el periodo o los filtros las limpia.

Los filtros, `group`, `month` y `year` quedan en la URL para restaurar o compartir el listado. Los hooks comunes y sus reglas de persistencia están documentados en `src/shared/hooks/README.md`.

Las acciones por lote usan los endpoints individuales, con un máximo de cinco escrituras simultáneas. Los éxitos se desmarcan y los fallos conservan su selección. No se presupone una transacción de lote en la API.

## Migración a consultas de servidor

El contrato `DataTableQuery` contiene `pagination`, `sorting`, `columnFilters` y `search`. El hook admite estado y callbacks controlados de cada parte, además de `resetKey` para los filtros externos del sheet. `onQueryChange` permite observar la consulta; usa un callback estable (`useCallback`) si lo necesitas.

Al migrar:

1. El hook de la feature debe mantener la consulta controlada y traducir los filtros del dominio a parámetros de API. Incluir consulta, periodo y filtros en la clave de React Query.
2. Aplicar debounce a la búsqueda de texto en ese hook antes de consultar la API. Usar `placeholderData: keepPreviousData` de React Query al cambiar de página para conservar filas y total mientras llega la nueva respuesta.
3. Pasar solamente los registros de la página recibida como `items`, `mode: "server"` y el total filtrado como `rowCount`.
4. Conectar `state.pagination`, `state.sorting`, `state.columnFilters` y `state.search` a sus respectivos callbacks. En servidor no se vuelve a filtrar, ordenar ni paginar la página recibida.
5. `pageIndex` empieza en cero; convertirlo a `pageIndex + 1` si la API usa páginas desde uno. Los cambios de filtros reinician la página; la página inicial controlada se respeta al montar.
6. Mantener `rowSelection` por ID fuera de las respuestas paginadas. Para acciones de servidor usar los IDs seleccionados: `getSelectedRowModel()` sólo contiene las filas actualmente cargadas.
7. Obtener totales y exportaciones completas desde la API: sumar o exportar la página recibida no representa todo el resultado filtrado.

`DataTableBasic` y `DataTableComplex` usan la misma instancia y pueden compartir estos controles. No es necesario crear otra implementación para servidor.

Referencias: [paginación manual](https://tanstack.com/table/v8/docs/guide/pagination), [selección](https://tanstack.com/table/v8/docs/guide/row-selection), [visibilidad de columnas](https://tanstack.com/table/v8/docs/guide/column-visibility).
