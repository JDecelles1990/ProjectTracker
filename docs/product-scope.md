# Product scope

## Product intent

ProjectTracker is a private, single-user desktop workspace for turning personal projects into manageable tasks. It favors a quiet overview and a dependable local database over accounts, collaboration, or file-based task records.

## MVP capabilities

- Maintain projects with a name, description, and identifying color.
- Maintain tasks with a title, notes, optional project and due date, status, and priority.
- See task totals, active work, today's due work, and overdue items at a glance.
- Browse all tasks, a project's tasks, or tasks due today.
- Search task titles, descriptions, and project names; filter by status, priority, and project.
- Configure the task-search keyboard shortcut and see the active shortcut beside search.
- Switch between locally persisted light and dark themes.
- Export projects, tasks, and preferences to a versioned JSON backup.
- Keep task, project, and preference data in a local SQLite database.

## Explicitly out of scope

This first version does not include accounts, sync, sharing, notifications, recurring tasks, subtasks, attachments, calendar integrations, or importing/restoring backups. It has no server component. Markdown documents describe the product and code; they are not used to store task/project records.

## Product principles

1. Local data remains usable without a network connection.
2. SQLite is the source of truth; renderer state is a view of persisted records.
3. Task and project behavior stays within one modular desktop application.
4. Destructive actions are explicit and project deletion preserves its tasks in the unassigned inbox.
