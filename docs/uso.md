# Cómo usar Kogane

Kogane registra tus gastos desde el chat (Telegram o **Mensajes** en la web) y los ordena en las mismas tablas que usabas en Notion. La web y el bot comparten la misma base (kogane-api).

## Registrar un gasto

| Desde | Cómo |
|---|---|
| **Telegram** (@kogane_finanzas_bot) o **Mensajes** en la web | Escribe como hablas: *almuerzo 25 soles con yape*, *netflix 45 mensual con la oh*, *zapatillas 300 con io en 3 cuotas*. También una captura de Yape o Plin, la foto de un voucher o una nota de voz. |
| **Nuevo gasto** en la web | Un diálogo (desde el menú o el botón de cada página, con el destino ya elegido): llenas el formulario y, si lo compartes, el reparto. Textos, capturas y audios van por Mensajes. |

El bot muestra un resumen con botones:
- **✅ Guardar**: lo guarda en su tabla y te llega un mensaje de confirmación.
- **✏️ Corregir**: escribe la corrección como quieras (*eran 30 soles y fue con la oh*).
- **📝 Borrador**: lo deja para revisarlo después.
- **❌ Descartar**.

Capturas del banco: el detalle de una compra de IO (con cuotas), un movimiento de Interbank (Plin o transferencia) y el resumen por categorías de IO se leen sin AI; Yape y la lista de movimientos pasan por la AI. El resumen por categorías no crea gastos: responde cuánto dice la app, cuánto tiene Kogane y cuánto falta registrar. Si mandas varias capturas juntas (álbum) o una captura trae varios movimientos, llega **una sola lista** con **✅ Guardar todos** (los repetidos o incompletos quedan en Borrador), **📝 Revisar uno por uno** y **📝 Borrador**.

Para corregir rápido, empieza el mensaje con la palabra del campo: *monto 30*, *persona dany*, *cuota 2/6*, *tarjeta oh*, *categoría comida*, *con culpa*, *ayer*.

## Destinos

| Destino | Qué es | Pantalla |
|---|---|---|
| Día a día | Gastos del día (comida, taxi, delivery) | Gastos ▸ Día a día |
| Tarjeta | Compras con tarjeta de crédito; van al mes de facturación de la tarjeta | Gastos ▸ Tarjetas |
| Costo fijo | Alquiler, luz, agua, internet, préstamos | Gastos ▸ Costos fijos |
| Plataforma | Netflix, Spotify, gimnasio (control; el cobro real es el de la tarjeta) | Gastos ▸ Plataformas |
| Me deben / Le debo | Préstamos y deudas con personas, en cuotas si hace falta | Préstamos y deudas |

## Borrador

Todo lo que no se guardó: lo que mandaste a 📝 Borrador, lo que quedó abierto más de 30 minutos y lo que la AI no pudo leer.
- **Por revisar**: edita lo que falte y guarda.
- **Fallidos**: *Reintentar* vuelve a pasar la captura, el audio o el texto por la AI.
- **Descartados**: por si te arrepientes.

En Telegram, `/borrador` muestra lo mismo con *Retomar* y *Descartar*. Las capturas y audios se guardan 7 días mientras están en Borrador; si guardas el gasto, se conservan.

## Préstamos y deudas

- *le presté 100 a dany* o *dany me prestó 50* registra la deuda; *iphone 1200 en 3 cuotas para dany* crea las 3 cuotas, una por mes.
- *dany me pagó 150*, *abono 150 dany* o *le pagué 50 a dany* registra un abono: cubre primero las cuotas más antiguas y se guarda recién con **✅ Confirmar** (**✏️ Elegir cuota** para asignarlo a otra).
- `/deudas` muestra quién te debe y a quién le debes; `/deudas dany` el detalle; `/cobrar dany` arma un mensaje para reenviarle.
- En la web: **Préstamos y deudas** ▸ Me deben · Debo · Por persona, con el botón de abono en cada cuota.

## Avisos

- El bot te avisa un día antes de cada vencimiento (pago y cierre de tarjeta, costos fijos, plataformas y cuotas de deudas), a las 09:00, con **✅ Pagado** · **✏️ Editar monto** · **🔕 Silenciar**. Después de ✏️, el siguiente mensaje es el monto (*45.90*).
- A las 21:00 llega el cierre del día (solo a la web, salvo que lo actives): lo que gastaste hoy, lo que vence hoy sin pagar, categorías al 80 % o más y **cargos raros** (una plataforma que cambió de precio, un cargo que aparece dos veces, una plataforma que no se cobró).
- El domingo a las 20:00, el resumen de la semana. El día 1 a las 06:00 se crean como pendientes los gastos de **Recurrentes** del mes.
- `/avisos` elige qué llega por Telegram; en la web, **Configuración ▸ Notificaciones** elige Telegram y web por tipo.

## Comandos del bot

`/borrador` · `/ultimos` · `/resumen` · `/deudas [persona]` · `/cobrar <persona>` · `/calendario` (próximos 14 días) · `/cuotas` (cuotas de tarjeta de 3 meses) · `/avisos` · `/uso` (cuánta AI se usó hoy y cuántas capturas leyó el OCR local) · `/cancelar` · `/ayuda`

## La web

- **Menú**: Inicio; **Registrar** (Mensajes, Reconocimiento / Importación, Borrador); Gastos; Préstamos y deudas; **Calendario**; Presupuesto (Grupos, Categorías, Ingresos) y Reportes. El número en Borrador es lo pendiente por revisar (con el grupo cerrado se ve en Registrar). **Nuevo gasto** es el botón de cada página.
- **Filtros**: las páginas de gastos, tarjetas y deudas tienen buscador y filtros (persona —Yo por defecto—, categoría, medio de pago, estado, cuotas, compartidos…), guardados en la URL.
- **Acciones (⋯)**: cada gasto de Día a día, Costos fijos, Plataformas y Tarjetas tiene un menú con Editar, Duplicar, Marcar como pagado, Estado, Pasar al mes siguiente y Eliminar (pide confirmación). El reparto de un gasto compartido se cambia desde el bot con /editar.
- **Vistas**: cada lista se ve como tabla o como tarjetas (el botón junto a los filtros); la elección se recuerda por página.
- **Presupuesto**: Inicio y Resumen muestran ingresos, gastado (tu parte), excedente y límite, el donut por categoría o grupo (clic para ver el detalle), presupuesto vs real y el excedente por mes. Los límites se ponen en Categorías (todos los meses o solo este) y los ingresos extra en Ingresos.
- **Reconocimiento / Importación** (en Registrar; `/estados-de-cuenta` redirige aquí): eliges qué subes y **nada se guarda en tus gastos hasta que lo apruebes**.
  - **Notion (ZIP o CSV):** el ZIP que exporta Notion tal cual, o sus `_all.csv`. Queda como **Previsualización** en el historial: pestaña **Resumen** (nuevas, cambiaron, iguales, avisos y el cruce mes a mes con el Resumen de Notion) y una pestaña por destino (**Tarjetas, Costos fijos, Plataformas, Deudas, Presupuesto, Avisos**) con buscador, filtro de estado, 50 filas por página y la columna **Se guardará en**. **Importar** escribe solo las nuevas y las que cambiaron (las iguales no se tocan); **Descartar** la borra sin importar nada. Préstamos y Terreno se ignoran hasta P27.
  - **Estado de cuenta (PDF):** subes el PDF (la tarjeta es opcional: se reconoce del PDF) que te manda el banco y se abre con tu **N.º de documento** (guárdalo en Configuración ▸ Personas; nunca se muestra completo). Se lee sin AI cuando sus movimientos suman el total; si no, la AI lee solo el texto, sin tu documento. Queda en tres pestañas: **Nuevos** (Crear, Crear todos o Ignorar), **Coinciden** (ya registrados) y **Solo en Kogane** (registrados que no aparecen: otro mes u otra tarjeta), con el total del banco contra lo registrado. El calendario usa la fecha y el total a pagar del estado de cuenta.
- **Campana** (arriba): los avisos sin leer, cada minuto; al tocar uno se despliega completo y queda leído; "Ir a …" lleva a su página. **Ver todas** abre Notificaciones, con el historial y filtros. Un aviso leído se puede volver a marcar como **no leído** (en la campana o en Notificaciones).
- **Calendario**: el mes con un punto por pago o cierre de cada día (toca un día para ver el detalle), los próximos 14 días con el botón **Pagado** y la pestaña **Cuotas comprometidas** (cada tarjeta, los 3 meses siguientes, con las cuotas "por generar").
- **Recurrentes**: **Generar** crea ya los gastos del mes en pantalla (nunca dos veces); igual se crean solos el día 1.
- **Configuración**: sueldo del mes, **Personas** (alias que entiende el bot, quién eres "Yo") **Cuentas y tarjetas** (las que tienes, cuáles salen en el bot y los días de cierre y pago) y **Notificaciones** (qué avisos van a Telegram y a la web).
- **Ctrl + K** (⌘K en Mac): buscar cualquier pantalla o tarjeta escribiendo parte del nombre.
- **Mes**: el selector de arriba cambia el mes de todas las pantallas; el lápiz al lado del sueldo lo edita para ese mes.
- **Mensajes** guarda el historial solo en ese navegador (*Limpiar* lo borra); los gastos quedan en la base igual.
- Las **capturas** siguen entrando por Mensajes (o el bot).
