# Data model

SQLite is the authoritative store. It is private to the local desktop profile and lives at `<Electron userData>/daymark.sqlite`.

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

The `searchShortcut` preference controls the task-search keyboard shortcut. Supported values are `mod+k`, `mod+shift+k`, and `mod+f`; `mod` means Command on macOS and Ctrl on Windows/Linux. A missing value falls back to `mod+k`.

## Migration policy

`src/main/schema.ts` owns schema migrations. The SQLite `user_version` integer records the latest applied migration: version 1 creates projects and tasks, and version 2 adds preferences with the default search shortcut. Each migration should be transactional and append-only after release.
