# Código compartido

`shared` contiene infraestructura y patrones que pueden usarse en cualquier feature.
La responsabilidad determina la ubicación: un componente de gastos sigue perteneciendo
a `expenses` aunque lo utilicen costos fijos, tarjetas y plataformas.

## Organización

| Carpeta                   | Responsabilidad                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `components/data-display` | Tabla, tarjetas, agrupación, modo de vista y estados vacíos.                            |
| `components/forms`        | Campos, etiquetas, fechas y selector de opciones recibido por props.                    |
| `components/filters`      | Select con búsqueda, búsqueda de texto y filtros aplicados.                             |
| `components/toolbar`      | Barra de acciones, contadores, exportación y agrupación.                                |
| `components/dialogs`      | Diálogo adaptable a escritorio y móvil.                                                 |
| `components/navigation`   | Navegación del periodo compartido.                                                      |
| `components/theme`        | Cambio de tema.                                                                         |
| `api`                     | Cliente HTTP, errores, proveedor de consultas y contratos generados de la API.          |
| `api/hooks`               | Consultas de catálogos comunes y mecanismo de mutaciones e invalidación.                |
| `api/server`              | Proxy de Astro; entrada exclusiva del servidor.                                         |
| `constants`               | Navegación, monedas, etiquetas financieras comunes y claves globales de almacenamiento. |
| `types`                   | Contratos de tablas, navegación y selectores genéricos.                                 |
| `hooks`                   | Tema, media queries, filtros en URL y persistencia del modo de vista.                   |
| `lib`                     | Fechas, monedas, CSV, iconos de archivos, texto y redirecciones de acceso.              |
| `utils`                   | Combinación de clases y funciones de navegación.                                        |
| `stores`                  | Periodo activo que comparten las pantallas.                                             |

Los primitives de shadcn permanecen en `src/ui`. Su alias de utilidades en
`components.json` apunta a `shared/utils/cn`.

## Propiedad de los componentes y hooks de negocio

| Feature                                                         | Código que antes estaba en shared                                                                                             |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `expenses`                                                      | Filtros de gastos, chips, acciones de filas, transferencia de series, estados, importes y reparto; hooks y helpers de gastos. |
| `categories`                                                    | Icono, etiqueta, selector y selector de iconos; catálogo de iconos y límites por categoría.                                   |
| `settings`                                                      | Selectores de personas y medios de pago.                                                                                      |
| `drafts`                                                        | Contador, hooks y destinos de borradores.                                                                                     |
| `budget`                                                        | Editor y diálogo de sueldo; consultas de resumen y presupuesto.                                                               |
| `attachments`                                                   | Panel, diálogos de archivos y vista previa; consultas, subida y eliminación de adjuntos.                                      |
| `auth`                                                          | Hooks de sesión, usuarios e invitaciones; servicios para URLs de Google.                                                      |
| `debts`                                                         | Consultas, mutaciones, constantes de deudas y generación de enlaces de reportes.                                              |
| `calendar`                                                      | Consultas y acciones del calendario.                                                                                          |
| `recurring`                                                     | Generación de gastos recurrentes y constantes de destinos.                                                                    |
| `incomes`                                                       | Consultas y mutaciones de ingresos.                                                                                           |
| `commitments`                                                   | Consultas, mutaciones y constantes de compromisos.                                                                            |
| `history`, `imports`, `messages`, `notifications`, `statements` | Hooks propios de cada módulo.                                                                                                 |
| `credit-cards`                                                  | Enlaces de tarjetas y estados permitidos.                                                                                     |
| `subscriptions`, `fixed-costs`                                  | Estados y constantes propios de cada recurso.                                                                                 |

La composición global de la aplicación (sidebar, menú móvil y buscador de pantallas)
vive en `src/layouts/components/navigation`, donde puede combinar features.
Los componentes reutilizables de `shared` no importan features.

## Exportaciones y dependencias

Cada feature y cada carpeta de módulos tiene un `index.ts` con exportaciones explícitas
de los componentes, constantes, tipos, hooks, servicios y helpers que define.
Los tipos se exportan con `export type`. Las listas y diccionarios existentes conservan
sus valores de API y las uniones literales; no se introducen enums numéricos.

Para consumidores externos se puede usar una entrada pública:

```ts
import { FixedCostListPage, FIXED_COST_STATUSES } from "@/features/fixed-costs";
import type { FixedCostGroupBy } from "@/features/fixed-costs";
import { FilterSelect } from "@/shared/components/filters";
import { useViewMode } from "@/shared/hooks";
import { cn } from "@/shared/utils";
```

Dentro de un módulo se importan archivos concretos. Para consumidores que necesitan
solo una utilidad, se recomienda el índice de su carpeta o el archivo directo.
Así una dependencia pequeña no pasa por un índice de componentes y hooks completos.

Los contratos de entidades en `api/types.ts` se derivan del esquema generado, para
mantener una sola definición del protocolo. El proxy se importa desde `shared/api/server`
y no forma parte del índice de navegador `shared/api` ni de `shared`.
