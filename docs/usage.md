# Usage guide

## Find your way around

- **Overview** shows summary cards and all tasks.
- **Due today** narrows the list to tasks whose due date is today.
- **Projects** in the sidebar scope the list to one project. The project menu lets you edit its details or delete it.

## Create and update

Use **New task** or **Add a task** to create a task. Give it a title; description, project, due date, status, and priority are optional or can be changed later by selecting the task title. Use the status control or the round check button to update its workflow state. The × action on a row deletes that task after confirmation.

Use the + beside Projects to create a project. Choose a name and optional description/color. Deleting a project asks for confirmation and moves its tasks to the unassigned list rather than deleting them.

## Search and filters

Search matches task title, description, and assigned project name. Combine it with status, priority, and project filters. Open the **Due today** view for a focused daily list. Clear search/filters to return to the full set.

## Search shortcut preferences

The keyboard shortcut hint beside task search shows the active shortcut; hover over it to see its purpose. Open **Preferences** from the workspace controls at the bottom of the sidebar to choose **Ctrl/Command + K**, **Ctrl/Command + Shift + K**, or **Ctrl/Command + F**. The modifier is Ctrl on Windows/Linux and Command on macOS. The selected shortcut is saved locally and focuses task search when another editable control does not have focus.

## Where data lives

Tasks, projects, and preferences are saved automatically to `daymark.sqlite` in Electron's application user-data folder. Closing and reopening the app does not remove them. This release has no sync or backup feature; users should back up the database file if they need an independent copy.
