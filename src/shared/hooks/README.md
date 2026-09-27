# Estado compartible en la URL

La URL es la fuente para restaurar los filtros y agrupaciones al recargar, abrir un enlace o navegar con atrás/adelante. Se actualiza con `replaceState` para que cada pulsación del buscador no cree otra entrada del historial. Se conservan parámetros de otros controles, el hash y `history.state`.

- `useUrlFilters(keys, defaults)`: cada pantalla declara los parámetros que posee. Admite valores completos o actualizaciones funcionales y sincroniza las instancias de la página con un evento común.
- `useUrlGrouping(allowed, fallback)`: usa `group`, valida los modos permitidos y elimina el parámetro al volver al modo predeterminado.
- `useUrlPeriod()`: conecta el store del navegador de meses con `month` y `year`. Es optativo para vistas cuyo periodo controla la consulta; costos fijos y cobros/deudas ya poseen estos parámetros dentro de sus filtros y no deben usar este hook.

Los defaults explícitos viajan también en el enlace. Si un filtro con default se limpia, se conserva un parámetro vacío (`month=`) para distinguir «todos los meses» de «usar el mes predeterminado». Así recargar no reaplica un filtro que el usuario había quitado.

## Ejemplos

- Costos fijos: `/costos-fijos?person=__me__&month=9&year=2026&group=category`.
- Costos fijos agrupados por persona: `group=person`.
- Cobros/deudas por persona y tarjeta: `group=person%2Ccard`.
- Cobros sin restricción de mes ni año: `/cobros?month=&year=`.
- Costos fijos de cualquier período: `/costos-fijos?month=&year=`.

En costos fijos, Mes y Año viven en «Período del registro» dentro del sheet de filtros. Ambos empiezan con el período actual y se pueden quitar individualmente con «Todos» o con sus chips. El rango de vencimiento es independiente y se combina con el período seleccionado; para consultar vencimientos de todos los períodos, se limpian Mes y Año.

La persistencia depende del enlace: una URL sin filtros empieza con los valores predeterminados de la pantalla. No se recuperan filtros antiguos de almacenamiento local por encima de una URL compartida.
