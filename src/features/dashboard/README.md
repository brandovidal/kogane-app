# Dashboard

La página de Inicio compone datos del período seleccionado y deja las consultas
y las reglas de preparación en módulos dedicados.

- `views/`: orden y composición de las áreas del dashboard.
- `sections/`: áreas con comportamiento propio, como pendientes.
- `components/`: tarjetas, controles y diálogos reutilizables de Inicio.
- `hooks/`: consultas y preparación de datos para las vistas.
- `lib/`: cálculos puros; por ejemplo, la previsión del siguiente mes.
- `constants/` y `types/`: estados de pago y contratos propios de la feature.
- `services/`: transformaciones de datos de API para la presentación.

El período permanece en el store compartido de la aplicación. Inicio no necesita
un store local ni una tabla de registros; sus áreas usan tarjetas y gráficos.
Los estilos siguen los tokens y utilidades compartidos de la aplicación.
