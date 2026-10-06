# Product scope

> Documentation cross-reference: [Documentation matrix](../DOCS-MATRIX.md).

## Product intent

ProjectTracker is a private, single-user desktop workspace for turning personal projects into manageable tasks. It favors a quiet overview and a dependable local database over accounts, collaboration, or file-based task records.

## Status indicators

Use these labels whenever documenting feature status:

- ✅ **Implemented** — present in the current application and supported by its source code.
- 🚧 **Planned** — explicitly approved for implementation but not yet present in the application.
- 💡 **Idea (not implemented)** — a possibility only; not committed or available to users.
- ⚠️ **Partial** — some behavior exists, but the described capability is incomplete. Explain what remains.

Only call a feature implemented after checking the current code. Keep the README and this scope document consistent; move entries between statuses when implementation changes.

## Implemented MVP capabilities

- ✅ Maintain projects with a name, description, and identifying color.
- ✅ Maintain tasks with a title, notes, optional project and due date, status, and priority.
- ✅ See task totals, active work, today's due work, and overdue items at a glance.
- ✅ Browse all tasks, a project's tasks, or tasks due today.
- ✅ Search task titles, descriptions, and project names; filter by status, priority, and project.
- ✅ Configure the task-search keyboard shortcut and see the active shortcut beside search.
- ✅ Switch between locally persisted light and dark themes.
- ✅ Export projects, tasks, and preferences to a versioned JSON backup.
- ✅ Keep task, project, and preference data in a local SQLite database.

## Ideas — not implemented

- 💡 Recurring tasks, reminders, and calendar integrations.
- 💡 Backup restore/import.

These are possibilities, not commitments. Do not describe an idea as available in the app until its implementation is present and verified.

## Not implemented / out of scope

The application does not include accounts, sync, sharing, subtasks, or attachments. It has no server component. Recurring tasks, reminders, calendar integrations, and backup restore/import are listed above as ideas only, not as commitments. Markdown documents describe the product and code; they are not used to store task/project records.

## Product principles

1. Local data remains usable without a network connection.
2. SQLite is the source of truth; renderer state is a view of persisted records.
3. Task and project behavior stays within one modular desktop application.
4. Destructive actions are explicit and project deletion preserves its tasks in the unassigned inbox.
