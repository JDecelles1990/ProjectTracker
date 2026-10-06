# Module responsibilities

| Path | Responsibility | Boundary |
|---|---|---|
| `src/shared/types.ts` | Shared task/project/status/priority, preferences, themes, backup, and API contracts | No runtime database or UI behavior |
| `src/main/database.ts` | SQLite connection and pragmas | Main process only |
| `src/main/schema.ts` | Versioned SQLite schema migrations, including user appearance preferences | Main process only |
| `src/main/repositories.ts` | Parameterized queries, persistence mapping, preference storage, and backup snapshot construction | Receives a database handle; no Electron UI |
| `src/main/validation.ts` | Runtime validation for IPC payloads, including supported shortcuts and themes | Converts unknown values into domain inputs |
| `src/main/index.ts` | Window lifecycle, IPC handlers, and JSON backup save flow | Orchestrates main-process modules and owns explicit filesystem export |
| `src/preload/index.ts` | Minimal, allow-listed renderer API including backup export | No business rules or database access |
| `src/renderer/App.tsx` | Overview, navigation, filters, task/project forms, preferences, theme toggle, and backup controls | Presentation and transient UI state |
| `src/renderer/styles.css` | Application visual design, light/dark themes, and responsive layout | Styling only |

The application is a modular monolith: these modules are separate for clarity and testability but compile and run as one desktop application. Domain persistence is deliberately centralized in the main process.
