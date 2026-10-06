# Data model

> Documentation cross-reference: [Documentation matrix](../DOCS-MATRIX.md).

SQLite is the authoritative store. It is private to the local desktop profile and lives at `<Electron userData>/projecttracker.sqlite`. On startup after the app rename, an existing `daymark.sqlite` database in the previous application-data location is copied forward so the original remains intact.

## `projects`

| Column | Type | Rules | Meaning |
|---|---|---|---|
| `id` | TEXT | Primary key | Generated stable identifier |
| `name` | TEXT | Required, 1–100 trimmed characters | Project label |
| `description` | TEXT | Required, defaults to empty | Project context |
| `color` | TEXT | Required, defaults to `#5b68d8` | UI accent color |
| `created_at` | TEXT | Required | ISO-8601 creation time |
| `updated_at` | TEXT | Required | ISO-8601 last update time |

Project task counts are derived from tasks and are not stored redundantly.

## `tasks`

| Column | Type | Rules | Meaning |
|---|---|---|---|
| `id` | TEXT | Primary key | Generated stable identifier |
| `project_id` | TEXT | Nullable foreign key; `ON DELETE SET NULL` | Optional owning project |
| `title` | TEXT | Required, 1–200 trimmed characters | Task label |
| `description` | TEXT | Required, defaults to empty | Optional task notes |
| `status` | TEXT | `todo`, `in_progress`, or `done` | Workflow state |
| `priority` | TEXT | `low`, `medium`, or `high` | Relative importance |
| `due_date` | TEXT | Nullable ISO calendar date (`YYYY-MM-DD`) | Optional due day |
| `created_at` | TEXT | Required | ISO-8601 creation time |
| `updated_at` | TEXT | Required | ISO-8601 last update time |

Indexes cover task status, project membership, and due date. Summary values and project counts are read-time aggregates to avoid stale duplicated state.

## `preferences`

| Column | Type | Rules | Meaning |
|---|---|---|---|
| `key` | TEXT | Primary key | Preference identifier |
| `value` | TEXT | Required | Stored preference value |

The `searchShortcut` preference controls the task-search keyboard shortcut. Supported values are `mod+k`, `mod+shift+k`, and `mod+f`; `mod` means Command on macOS and Ctrl on Windows/Linux. The `theme` preference stores `light` or `dark` appearance. Missing values fall back to `mod+k` and `light`.

## Migration policy

`src/main/schema.ts` owns schema migrations. The SQLite `user_version` integer records the latest applied migration: version 1 creates projects and tasks, version 2 adds preferences with the default search shortcut, and version 3 seeds the light theme preference. Each migration should be transactional and append-only after release.
