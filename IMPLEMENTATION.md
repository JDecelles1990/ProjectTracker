# ProjectTracker implementation status

> Documentation cross-reference: [Documentation matrix](DOCS-MATRIX.md).

This file summarizes the capabilities currently present in the application. It is not a roadmap; see [Product scope](docs/product-scope.md) for the shared feature-status labels and idea-only items.

## Implemented

- Projects and tasks: create, edit, delete, project assignment, task status, priority, and optional due dates.
- Overview: summary cards, full task list, project view, and Due today view.
- Search and filters: task search, status/priority/project filtering, and Clear filters.
- Search shortcut: configurable shortcut with visible hint and hover description.
- Appearance: top-bar light/dark mode toggle persisted in SQLite preferences.
- Backup: export a versioned JSON snapshot of projects, tasks, and preferences.
- Local-first persistence: SQLite is the source of truth; Electron main process validates IPC requests and owns database access.
- Existing user data: first launch after the application rename copies the previous database forward and retains the original.

## Not implemented

Accounts, sync, sharing, recurring tasks, reminders, subtasks, attachments, calendar integrations, backup restore/import, and release packaging/signing are not currently implemented. Potential ideas are not commitments.

## Validation

Use the current scripts rather than treating old build artifacts or historical results as authoritative:

```powershell
npm test
npm run typecheck
npm run build
```

See [Setup and development](docs/setup.md) for Windows native-module ABI notes and [Usage](docs/usage.md) for current user workflows.
