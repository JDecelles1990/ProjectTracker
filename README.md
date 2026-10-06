# Daymark

Daymark is a local-first desktop app for keeping personal projects and tasks in one clear, manageable workspace. Create projects, capture tasks, set priorities and due dates, and focus on what needs attention today.

Task and project records live in a local SQLite database on your device. Markdown files document the product and guide development; they are not used as a task database. Daymark does not require an account or a network service.

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

- Create, edit, and delete projects and tasks.
- Organize tasks by project, status, priority, and optional due date.
- Review overview counts for open, in-progress, due-today, and overdue work.
- Search tasks and filter by status, priority, project, or due-today.
- Focus task search with a configurable keyboard shortcut and see the shortcut on hover.
- Keep data locally in SQLite under Electron's application-data directory.

For the current scope and known non-goals, see [Product scope](docs/product-scope.md). For an in-app walkthrough, see [Usage](docs/usage.md).

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
- [Usage](docs/usage.md) — using projects, tasks, search, and filters.
- [Setup and development](docs/setup.md) — prerequisites, commands, Windows troubleshooting, and packaging notes.
- [Agent and contributor guidance](AGENTS.md) — repository conventions and required architectural safeguards.
