# Cómo usar Kogane

Kogane registra tus gastos desde el chat (Telegram o **Mensajes** en la web) y los ordena en las mismas tablas que usabas en Notion. La web y el bot comparten la misma base (kogane-api).

## Registrar un gasto

| Desde | Cómo |
|---|---|
| **Telegram** (@kogane_finanzas_bot) o **Mensajes** en la web | Escribe como hablas: *almuerzo 25 soles con yape*, *netflix 45 mensual con la oh*, *zapatillas 300 con io en 3 cuotas*. También una captura de Yape o Plin, la foto de un voucher o una nota de voz. |
| **Nuevo gasto** en la web | Eliges el destino y llenas el formulario, o pegas un texto y la AI lo prellena. |

El bot muestra un resumen con botones:
- **✅ Guardar**: lo guarda en su tabla y te llega un mensaje de confirmación.
- **✏️ Corregir**: escribe la corrección como quieras (*eran 30 soles y fue con la oh*).
- **📝 Borrador**: lo deja para revisarlo después.
- **❌ Descartar**.

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

## Comandos del bot

`/borrador` · `/ultimos` · `/resumen` · `/deudas [persona]` · `/cobrar <persona>` · `/uso` (cuánta AI se usó hoy) · `/cancelar` · `/ayuda`

## La web

- **Menú**: Mensajes, Reconocimiento y Borrador arriba; luego Inicio, Nuevo gasto y los grupos. El número en Borrador es lo pendiente por revisar.
- **Ctrl + K** (⌘K en Mac): buscar cualquier pantalla o tarjeta escribiendo parte del nombre.
- **Mes**: el selector de arriba cambia el mes de todas las pantallas; el lápiz al lado del sueldo lo edita para ese mes.
- **Mensajes** guarda el historial solo en ese navegador (*Limpiar* lo borra); los gastos quedan en la base igual.
- **Reconocimiento** (varias capturas o un estado de cuenta a la vez) llega con P21; mientras tanto, manda cada captura por Mensajes.
