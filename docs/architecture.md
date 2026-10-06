# Architecture

> Documentation cross-reference: [Documentation matrix](../DOCS-MATRIX.md).

ProjectTracker is a **modular monolith** packaged as a desktop application. Its modules have explicit responsibilities and testable boundaries, but they ship together as one application. There are no network services.

## Runtime shape

```text
React renderer
  presentation and transient UI state
          │ window.tracker (typed API)
          ▼
Electron preload
  explicit contextBridge API and IPC forwarding
          │ named IPC channels
          ▼
Electron main process
  payload validation → repositories
          │ parameterized SQL
          ▼
SQLite
  <Electron userData>/projecttracker.sqlite
```

The renderer has no direct access to Node.js, Electron IPC, the filesystem, or SQLite. The main process owns persistence and treats renderer-supplied IPC payloads as untrusted input. The explicit backup-export handler is the only feature path that opens a native file-save dialog and writes an application-generated JSON file.

## Process boundaries

### Renderer — `src/renderer/`

`App.tsx` owns the current overview and due-today views, local search/filter state, forms, preferences UI, and presentation. The search shortcut and appearance theme are loaded and saved through `window.tracker`; the renderer registers the configured shortcut and updates its visible hint, and applies the selected light/dark theme. It also offers a typed `exportBackup` call and reports its result. It must not import Electron APIs, open the database, or contain persistence queries. `styles.css` owns visual presentation.

### Preload — `src/preload/`

`index.ts` exposes the small `TrackerApi` contract from `src/shared/types.ts` through `contextBridge`. It forwards only named, application-specific operations. Do not expose generic `ipcRenderer`, filesystem access, or database handles to the renderer.

### Main process — `src/main/`

- `index.ts` creates the application window, registers named IPC handlers, and implements the explicit JSON backup save-dialog/write flow.
- `validation.ts` parses IPC values from `unknown` into validated domain inputs before mutation.
- `repositories.ts` owns SQL operations, persistence mapping, read-time summaries, and persisted preferences.
- `database.ts` creates and configures the SQLite connection.
- `schema.ts` applies versioned schema migrations.

Keep business persistence in the main process. Repositories should remain independent of renderer presentation and receive a database handle rather than create UI state.

### Shared contracts — `src/shared/`

`types.ts` defines task and project records, mutation inputs, enums, summaries, preference contracts, and the renderer-facing `TrackerApi`. Keep shared code limited to contracts needed across process boundaries; do not put database or UI behavior here.

For the file-by-file ownership table, see [Module responsibilities](modules.md).

## Request and error flow

1. The renderer calls a typed `window.tracker` method.
2. Preload forwards it on a named IPC channel.
3. The matching main-process handler validates mutation input before calling a repository.
4. The repository runs parameterized SQLite statements and returns domain-shaped records.
5. The renderer updates or refreshes its local view and presents failures to the user.

When adding an operation, define its input and return type in shared contracts, expose only that method from preload, register and validate its matching IPC handler, implement persistence in the repository, and update the UI. The search shortcut preference currently supports `mod+k`, `mod+shift+k`, and `mod+f`, where `mod` maps to Command on macOS and Ctrl elsewhere. Appearance preference supports the light and dark themes. Backup export uses a fixed IPC operation, an application-generated snapshot, and a native save dialog; do not expose generic file writing or add a broad generic IPC escape hatch.

## Persistence and migrations

SQLite is the authoritative store for projects, tasks, and user preferences. The database is opened lazily at `<Electron userData>/projecttracker.sqlite`; startup enables foreign keys and write-ahead logging. The current schema is versioned with `PRAGMA user_version` and includes database constraints and indexes in addition to runtime validation. Schema version 2 adds a `preferences` key/value table and seeds the configurable task-search shortcut with `mod+k`; version 3 adds the default light theme.

Schema changes belong in `src/main/schema.ts` as forward, transactional migrations. Once a migration is released, append a new migration instead of editing the old one. Schema version 3 seeds a `light` theme preference alongside the configurable search shortcut. Keep repositories on bound parameters, preserve existing records through migrations, and add tests for changed schema and repository behavior. See [Data model](data-model.md) for tables and relationships.

## Electron safeguards

The main window uses `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`. Preserve these settings. Keep the preload API allow-listed and narrow, validate all renderer-controlled mutation payloads in the main process, and never interpolate user input into SQL.

Deleting a project detaches its tasks with `ON DELETE SET NULL`; it does not delete those tasks. This is an intentional data-retention behavior.

## Testing and extension

Database and repository tests can use an in-memory SQLite database so they do not touch a user's live data. Add or update focused tests when changing validation, persistence, IPC contracts, or business behavior. Run `npm test`, `npm run typecheck`, and `npm run build` for the relevant changes; see [Setup and development](setup.md).

Keep new capabilities inside their owning module/domain. Add a new module only when it improves an actual boundary; do not split the application into services or duplicate data into Markdown files.
