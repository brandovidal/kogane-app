# Patrones de gastos

Los controles visuales genéricos se importan desde `shared` y los componentes base
desde `ui`. Las reglas específicas de gastos permanecen en esta feature.

## Filtros

- `constants/expense-filters.ts`: `PERSON_ALL`, `PERSON_ME`, etiquetas, valores tipados de cuotas y compartidos, opciones fijas y configuración del sheet.
- `types/expense-filters.ts`: contratos de los valores, campos y registros filtrables. Los valores de cuotas y compartidos derivan de sus constantes.
- `hooks/useExpensePersonOptions.ts` y `components/filters/ExpensePersonFilter.tsx`: comparten el filtro multi-select de personas en barras y sheets. Incluye búsqueda por nombre/alias, conteos de registros, «Sin asignar», resumen de selección y estado vacío.
- `components/filters/ExpenseFilters.tsx`: compone la barra y el sheet; actualiza el objeto de filtros.
- `components/filters/ExpenseFilterFields.tsx`: presenta Persona con el componente compartido y los demás campos con `FilterSelect`. En el sheet, Período, Persona, Categoría y Estado forman una cuadrícula de filtros principales. Medio de pago, Moneda, Tipo, Compartidos, periodicidad y Vencimiento se agrupan en «Ver más filtros». Solo aparecen los campos disponibles de cada vista.
- `shared/components/filters/MoreFilters.tsx`: sección reutilizable con Collapsible y Marker. El contador indica filtros adicionales activos aun cuando estén plegados; plegarlos conserva sus valores y sus parámetros en la URL.
- `lib/expense-filters.ts`: aplica las reglas a los registros. Reexporta los contratos anteriores para conservar compatibilidad con consumidores existentes.

«Todos» se representa como ausencia de filtro; se conserva `PERSON_ALL = "all"`
para enlaces existentes. Las selecciones de Persona se guardan como ids separados
por comas; `PERSON_ME = "__me__"` identifica a la persona predeterminada y
`PERSON_UNASSIGNED` filtra registros sin persona. Categorías y medios de pago usan sus ids.
`FilterSelect` admite `searchTerms` opcionales para buscar nombres alternativos sin
cambiar la etiqueta ni el valor de la opción. La búsqueda ignora mayúsculas y tildes.

El hook, las constantes y los tipos se exportan desde sus índices y el `index.ts`
de la feature. Los archivos internos importan los módulos concretos para evitar
ciclos a través de los índices.
