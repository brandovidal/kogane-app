# Settings feature

Configuración de la cuenta se organiza por páginas y vistas. `pages/SettingsPage.tsx` enruta las subsecciones existentes; `views/GeneralSettingsView.tsx` compone Apariencia, Región y Presupuesto desde `sections/general/`.

- `components/`: piezas de catálogos y navegación agrupadas por dominio.
- `constants/` y `types/`: navegación, opciones de región y contratos de dominio.
- `hooks/` y `stores/`: preferencias locales de la vista y estado plegable de navegación.
- `lib/`: conversiones y validaciones de formularios existentes.
- `styles/`: estilos puntuales de la vista General.
- `pages/`, `sections/` y `views/`: composición de página y sus secciones.

La apariencia usa el store global de tema de la aplicación. Moneda y zona horaria se guardan como preferencias locales del navegador; todavía no se sincronizan con el backend ni alteran los cálculos o recordatorios globales.
