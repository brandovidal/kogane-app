# Formularios de borrador

`DraftForm` conserva las reglas y el cuerpo de la API para cada destino.
Al registrar un costo fijo usa `FixedCostDraftTabs`, con pestañas General,
Programación, Reparto y Notas. Las secciones viven en `sections/` y reciben
`DraftFormSectionProps`; el estado del gasto permanece en el contenedor.

Los campos de cuotas se comparten con el editor de costos fijos mediante
`features/expenses/components/forms/InstallmentFields`. La interfaz tiene dos
entradas numéricas y conserva el formato `n/m` de la API. La validación limita
las cuotas a enteros entre 1 y 999 y exige que la actual no supere el total.

Los controles base se importan de `src/ui`; los campos, iconos y selectores
reutilizables se importan de los módulos que los mantienen.
