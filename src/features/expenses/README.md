# Patrones de gastos

Los controles visuales genéricos se importan desde `shared` y los componentes base
desde `ui`. Las reglas específicas de gastos permanecen en esta feature.

## Filtros

- `constants/expense-filters.ts`: `PERSON_ALL`, `PERSON_ME`, etiquetas, valores tipados de cuotas y compartidos, opciones fijas y configuración del sheet.
- `types/expense-filters.ts`: contratos de los valores, campos y registros filtrables. Los valores de cuotas y compartidos derivan de sus constantes.
- `hooks/useExpensePersonOptions.ts`: prepara «Yo» y las demás personas activas, sin duplicar la persona predeterminada. Permite encontrar «Yo» por su nombre registrado (por ejemplo, Brando) y sus alias; las demás personas también se buscan por sus alias.
- `components/filters/ExpenseFilters.tsx`: compone la barra y el sheet; actualiza el objeto de filtros.
- `components/filters/ExpenseFilterFields.tsx`: presenta los campos usando `FilterSelect` directamente, incluido Persona.
- `lib/expense-filters.ts`: aplica las reglas a los registros. Reexporta los contratos anteriores para conservar compatibilidad con consumidores existentes.

«Todos» se representa como ausencia de filtro; se conserva `PERSON_ALL = "all"`
para enlaces existentes. «Yo» usa `PERSON_ME = "__me__"`, que se resuelve al id de
la persona predeterminada al filtrar. Categorías y medios de pago usan sus ids.
`FilterSelect` admite `searchTerms` opcionales para buscar nombres alternativos sin
cambiar la etiqueta ni el valor de la opción. La búsqueda ignora mayúsculas y tildes.

El hook, las constantes y los tipos se exportan desde sus índices y el `index.ts`
de la feature. Los archivos internos importan los módulos concretos para evitar
ciclos a través de los índices.
