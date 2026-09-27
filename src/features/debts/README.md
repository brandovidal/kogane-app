# Debt feature structure

- `views/` contains the page-level compositions: list, summary, and detail.
- `sections/` contains focused UI sections used by those views, such as filters, result grids, summary cards, and payment summaries.
- `components/dialogs/` contains create, edit, and payment dialogs.
- `hooks/` holds query-backed view models and calculations such as the debt summary.
- `debt-filters.ts` holds debt filter types and pure filtering/grouping helpers.
- `index.ts` is the feature's public API for route files and other features. Internal feature imports should use direct file paths to avoid circular barrel imports.

Keep route views responsible for state and composition. Move growing visual sections into `sections/`, and keep business transformations in pure helpers or hooks so they can be reused without duplicating UI logic.
