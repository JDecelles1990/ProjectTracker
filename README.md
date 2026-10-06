# ProjectTracker

ProjectTracker is a local-first desktop app for keeping personal projects and tasks in one clear, manageable workspace. Create projects, capture tasks, set priorities and due dates, and focus on what needs attention today.

Task and project records live in a local SQLite database on your device. Markdown files document the product and guide development; they are not used as a task database. ProjectTracker does not require an account or a network service.

## Get started

### Requirements

- Windows 10 or newer
- Node.js 20 or newer and npm

### Run the app

From the project directory, run:

```powershell
npm install
npm run dev
```

For Electron runtime, native SQLite setup notes, and troubleshooting, see [Setup and development](docs/setup.md).

## What you can do

- ✅ **Implemented:** Create, edit, and delete projects and tasks.
- ✅ **Implemented:** Organize tasks by project, status, priority, and optional due date.
- ✅ **Implemented:** Review overview counts for open, in-progress, due-today, and overdue work.
- ✅ **Implemented:** Search tasks and filter by status, priority, project, or due-today.
- ✅ **Implemented:** Focus task search with a configurable keyboard shortcut and see the shortcut on hover.
- ✅ **Implemented:** Switch between light and dark themes; the selected appearance is saved locally.
- ✅ **Implemented:** Export projects, tasks, and preferences as a JSON backup from Preferences.
- ✅ **Implemented:** Keep data locally in SQLite under Electron's application-data directory.

The ✅ marker identifies features currently implemented. 💡 entries in the Ideas section are not implemented. For the complete status key and product scope, see [Product scope](docs/product-scope.md); for an in-app walkthrough, see [Usage](docs/usage.md).

## Ideas — not implemented

💡 **Idea (not implemented):** Recurring tasks, reminders, backup restore, and calendar integrations are possibilities rather than commitments.

## Development checks

```powershell
npm test
npm run typecheck
npm run build
```

The build creates the Electron application bundles; a distributable installer and release/signing workflow are not currently configured.

## Documentation

- [Architecture](docs/architecture.md) — process boundaries, data flow, persistence, and extension guidance.
- [Module responsibilities](docs/modules.md) — ownership of source directories and files.
- [Data model](docs/data-model.md) — SQLite tables, constraints, and migration policy.
- [Product scope](docs/product-scope.md) — goals, current capabilities, and non-goals.
- [Feature plan](PLAN.md) — proposed future increments, boundaries, and acceptance criteria (planning only).
- [Usage](docs/usage.md) — using projects, tasks, search, and filters.
- [Setup and development](docs/setup.md) — prerequisites, commands, Windows troubleshooting, and packaging notes.
- [Agent and contributor guidance](AGENTS.md) — repository conventions and required architectural safeguards.
