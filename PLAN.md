# ProjectTracker feature plan

**Status: planning only.** This document proposes future product work; it does not authorize implementation or imply that any listed feature is available. Check the status indicators in [Product scope](docs/product-scope.md) and verify current code before changing a status. The next implementation slice should be explicitly selected before work begins.

## Recommendation

Implement **safe JSON backup restore** first. ProjectTracker already exports a versioned JSON snapshot, so restore completes a useful local-data safety workflow without introducing a new service or external dependency. It is also a bounded opportunity to establish import validation and recovery behavior before considering larger task-lifecycle changes.

Follow it with recurring tasks, then reminders. Treat calendar integration as a separate discovery decision; a simple calendar export may be a better first increment than two-way synchronization.

## Status indicators

- ✅ **Implemented** — verified in the current application source.
- 🚧 **Planned** — explicitly selected for implementation; not yet available.
- 💡 **Idea (not implemented)** — proposed possibility, not a commitment.
- ⚠️ **Partial** — some behavior exists; remaining work is named.

All features in this plan are currently **💡 Idea (not implemented)** until an implementation slice is explicitly approved. Moving an item to **🚧 Planned** requires a deliberate scope decision; moving it to **✅ Implemented** requires code and validation evidence.

## Verified baseline

Baseline checked against the local ProjectTracker source on 2026-10-06 at commit `a5c94d0`:

| Area | Current behavior |
|---|---|
| Application shape | Windows-first Electron desktop app; React + TypeScript renderer; one modular monolith |
| Persistence | SQLite is authoritative for projects, tasks, and preferences; schema migrations are in `src/main/schema.ts` |
| Tasks | CRUD, project assignment, `todo` / `in_progress` / `done`, `low` / `medium` / `high`, optional calendar due date |
| Views | Overview, project view, Due today, summary cards, search, status/priority/project filters |
| Preferences | Search shortcut and light/dark theme persisted in SQLite |
| Backup | `projecttracker-backup`, version 1 JSON export of projects, tasks, preferences, and export timestamp |
| Import/restore | No file selection, backup parser, preview, or restore workflow is implemented |
| Automation | No recurrence model, reminder scheduler/notifications, or calendar integration is implemented |
| Tests | Vitest tests cover repositories, schema migration, preference persistence, and IPC validation |

The baseline is a planning reference, not a guarantee of the current remote head. Recheck branch, working tree, and current source before implementation. User database contents and backup files were not inspected for this plan.

## Proposed roadmap

Every slice is independently scoped, testable, and may be reordered only after reviewing dependencies. Do not bundle all four capabilities into one implementation.

| Proposed slice | Capability | Proposed status |
|---|---|---|
| **PT-061** | Safely validate, preview, and restore a ProjectTracker JSON backup | 💡 Idea |
| **PT-062** | Create a next task occurrence when a recurring task is completed | 💡 Idea |
| **PT-063** | Notify the user about due-soon and overdue tasks | 💡 Idea |
| **PT-064** | Export selected tasks as a calendar file (`.ics`) | 💡 Idea |

PT-061 is recommended as the next slice because it builds directly on existing backup export. Each later slice requires its own scope review and status change before implementation.

## PT-061 — Safe JSON backup restore

### User outcome

The user can select a ProjectTracker JSON backup, inspect what it contains, and intentionally replace the current local tracker data. Invalid or incompatible input cannot mutate the database.

### Proposed behavior

- Add **Restore backup** beside **Export backup** in Preferences and open files using Electron's native open dialog.
- Parse and validate the chosen file before presenting a preview. Show its export date and project/task counts; clearly state that restore replaces current tracker records.
- Support replacement only in the first increment. Do not attempt automatic merge or conflict resolution.
- Require a separate, explicit confirmation after preview. Canceling file selection, preview, or confirmation leaves application data unchanged.
- Before replacement, write a safety backup of the current tracker through the established native save-dialog/file boundary. If the safety backup cannot be written, do not proceed with replacement.
- Restore projects, tasks, and preferences as one database transaction. Preserve valid record IDs and timestamps; do not import computed project/task counts or joined display fields as stored data.
- Refresh the visible task/project/summary state only after a successful commit. Report validation, safety-backup, and database errors explicitly.
- Keep backup selection, file reading, validation, and persistence in the main-process boundary; do not expose generic filesystem access to the renderer.

### Backup compatibility and validation

- Preserve the existing `projecttracker-backup` format discriminator and validate supported version numbers explicitly.
- Verify the exact existing v1 shape before implementation. Historical v1 files created before the theme preference may omit `preferences.theme`; if so, document and test a compatibility default of `light`.
- Validate the top-level object, export timestamp, arrays, IDs, lengths, enum values, dates, project references, and preference values before any database write.
- Reject malformed JSON, unsupported versions, duplicate project/task IDs, orphan project references, invalid task fields, and unreasonable file/collection sizes with actionable, non-sensitive errors.
- Treat parsed files as untrusted input. Bound file size and collection sizes, and never interpolate imported values into SQL.
- Build normalized persistence inputs from documented domain fields only. Ignore derived `projectName`, `taskCount`, and `completedTaskCount`; do not silently repair invalid records.

### Failure and recovery semantics

- Parse or validation failure: no database changes.
- User cancellation: no database changes.
- Safety-backup failure: no database changes.
- Transaction failure: rollback the entire replacement; show failure and retain the safety backup if one was already created.
- Success: report restored counts and safety-backup location.
- Do not delete, overwrite, or clean up the selected input or the user's existing database as part of validation.

### Acceptance criteria

- Valid current backup can be previewed and restored, including its projects, tasks, and preferences.
- A supported older v1 backup missing the later theme field uses the documented default without dropping other preferences.
- Cancel at every confirmation boundary leaves the database unchanged.
- Invalid JSON, unknown versions, malformed records, duplicate IDs, references to missing projects, and over-limit files are rejected without mutation.
- Safety-backup write failure prevents restore.
- Restore commits atomically; injected database failure preserves the pre-restore records.
- User sees restored counts, errors, and the safety-backup path without seeing raw stack traces or file contents.
- Existing export, CRUD, preference, and startup-migration behavior remains unchanged.

### Likely implementation surfaces

- `src/shared/types.ts` — restore preview/result and IPC contracts.
- `src/main/validation.ts` or a focused backup-validation module — runtime parsing and bounds.
- `src/main/repositories.ts` — transactionally replace stored records from normalized inputs.
- `src/main/index.ts` — native file dialogs, bounded read, validation orchestration, safety backup.
- `src/preload/index.ts` — narrow typed import/restore methods.
- `src/renderer/App.tsx` and `src/renderer/styles.css` — preview, confirmation, progress/result states.
- `src/main/schema.ts` — only if implementation demonstrates a necessary data-model migration; restore by itself should not require a schema change.
- Focused repository, validation, persistence, and renderer workflow tests; update `docs/usage.md`, `docs/architecture.md`, `docs/data-model.md` only where implementation changes their claims.

## PT-062 — Recurring tasks

### Proposed boundary

Represent a recurring series separately from each dated task occurrence. Completing one occurrence creates the next occurrence according to the series rule; it must not silently reset the completed task or duplicate occurrences on repeated status updates.

### Decisions to settle before implementation

- Supported cadence and interval syntax (initial recommendation: daily, weekly, and monthly, with no arbitrary rule language).
- Month-end behavior (initial recommendation: clamp to the last valid day of the target month).
- Whether the next occurrence inherits project, description, priority, and status (initial recommendation: inherit content/project/priority, start as `todo`, and preserve a link to the series).
- Behavior when a user edits or deletes one occurrence versus the whole series.
- Whether completing an overdue occurrence schedules from the prior due date or completion date (initial recommendation: advance from the scheduled due date, skipping past occurrences rather than creating a burst).
- Time zone and calendar-date handling; initial implementation should use local calendar dates consistently with task due dates and must not add time-of-day semantics.

### Acceptance criteria

- Completing a recurring task produces at most one next occurrence, transactionally with completion.
- Repeated completion/status updates do not create duplicates.
- Skipped, overdue, month-end, and leap-year cases are deterministic and tested.
- Non-recurring task CRUD and completion behavior remains unchanged.
- Recurrence series and occurrence relationships are documented and migrated forward without loss of existing tasks.

## PT-063 — Reminders

### Proposed boundary

Provide opt-in local desktop notifications for tasks with a due date. Do not add a cloud scheduler, accounts, email/SMS, or hidden background service.

### Decisions to settle before implementation

- Reminder timing and whether defaults are off (initial recommendation: opt-in, with a small set of relative timing options).
- Whether reminders run only while the app is open or use an OS startup/background mechanism (initial recommendation: while the app is running only).
- Quiet hours, snooze, notification permission denial, and repeated overdue notifications.
- Whether recurring-task reminders depend on PT-062 data model; recurrence should be completed first if reminders need series semantics.

### Acceptance criteria

- User can enable/disable reminders and choose supported timing; preference is persisted.
- Only eligible, incomplete tasks with a due date are notified.
- A task receives no duplicate notification for the same reminder occurrence in one app session.
- Permission denial and unsupported notification behavior are visible and non-fatal.
- No task title or description is transmitted outside the local desktop process.

## PT-064 — Calendar export

### Proposed boundary

Prefer a user-initiated `.ics` export over two-way calendar sync as the first calendar increment. Export only explicitly selected tasks or a clearly specified date range. No network account, calendar credentials, background synchronization, or implicit data upload.

### Decisions to settle before implementation

- Selection workflow and date range.
- Whether to include completed tasks and which task fields appear in calendar summaries.
- Due dates have date-only semantics today; decide how to represent all-day events without inventing a time or time zone.
- Whether output contains private task descriptions or only titles/dates.

### Acceptance criteria

- Export uses a native save dialog, reports cancellation/errors, and does not mutate tracker records.
- Generated `.ics` has valid escaping, stable unique event IDs, correct all-day date semantics, and bounded content.
- Export scope is previewed or unambiguous before saving.
- Unit tests cover escaping, dates, completed tasks, and empty selection.

## Cross-slice constraints

- Preserve the modular-monolith boundary: renderer → typed preload API → validated main-process operation → repository/database or native OS integration.
- SQLite remains authoritative for task, project, and preference records; Markdown files remain documentation, not task storage.
- Add forward, transactional migrations only when a selected feature requires new persisted fields or relations; never edit a released migration.
- Preserve existing project deletion semantics (`ON DELETE SET NULL` for tasks).
- Keep APIs narrow and domain-specific. Do not add services, cloud dependencies, or generic IPC/file access for convenience.
- Update status indicators and directly related documentation in the same change as the implementation.
- Run the smallest relevant tests during iteration, then `npm test`, `npm run typecheck`, and `npm run build` before declaring a slice complete.
- On Windows, account for the Electron versus system Node ABI requirements of `better-sqlite3`; follow the recovery guidance in [Setup and development](docs/setup.md).

## Non-goals for these proposals

Unless a later plan explicitly approves them, do not include cloud sync, accounts, collaboration, sharing, email/SMS, task attachments, AI-generated schedules, automatic calendar sync, arbitrary recurrence rules, or background services.

## Readiness and stop condition

This document is a proposal, not an implementation-ready authorization. Before starting a slice:

1. Recheck current `main`, source, tests, documentation, and working-tree state.
2. Confirm the selected capability and settle its open decisions.
3. Mark only the selected item **🚧 Planned**, and narrow its scope and acceptance criteria if needed.
4. Implement and verify that slice independently; update its status only with evidence.
5. Stop if safety, data-loss, or platform behavior cannot meet the stated acceptance criteria; report the blocker rather than broadening scope silently.
