import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";
import type {
  Project,
  ProjectInput,
  Preferences,
  SearchShortcut,
  Task,
  TaskInput,
  TrackerSummary,
} from "@shared/types";

type TaskRow = Omit<Task, "projectId" | "projectName" | "dueDate" | "createdAt" | "updatedAt"> & {
  project_id: string | null;
  project_name: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

const taskColumns = `
  t.id, t.project_id, p.name AS project_name, t.title, t.description, t.status, t.priority,
  t.due_date, t.created_at, t.updated_at
`;

export function createRepositories(db: Database.Database) {
  const listTasks = (): Task[] => {
    const rows = db.prepare(`
      SELECT ${taskColumns} FROM tasks t LEFT JOIN projects p ON p.id = t.project_id
      ORDER BY CASE t.status WHEN 'done' THEN 2 WHEN 'in_progress' THEN 1 ELSE 0 END,
        CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        t.due_date IS NULL, t.due_date, t.created_at DESC
    `).all() as TaskRow[];
    return rows.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      projectName: row.project_name,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  };

  const listProjects = (): Project[] => db.prepare(`
    SELECT p.id, p.name, p.description, p.color, p.created_at AS createdAt, p.updated_at AS updatedAt,
      count(t.id) AS taskCount,
      sum(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS completedTaskCount
    FROM projects p LEFT JOIN tasks t ON t.project_id = p.id
    GROUP BY p.id ORDER BY p.name COLLATE NOCASE
  `).all().map((row) => {
    const project = row as Omit<Project, "completedTaskCount"> & { completedTaskCount: number | null };
    return { ...project, completedTaskCount: project.completedTaskCount ?? 0 };
  });

  const saveTask = (input: TaskInput): Task[] => {
    const now = new Date().toISOString();
    const id = input.id ?? randomUUID();
    db.prepare(`
      INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, created_at, updated_at)
      VALUES (@id, @projectId, @title, @description, @status, @priority, @dueDate, @now, @now)
      ON CONFLICT(id) DO UPDATE SET project_id=@projectId, title=@title, description=@description,
        status=@status, priority=@priority, due_date=@dueDate, updated_at=@now
    `).run({ ...input, id, now });
    return listTasks();
  };

  const saveProject = (input: ProjectInput): Project[] => {
    const now = new Date().toISOString();
    const id = input.id ?? randomUUID();
    db.prepare(`
      INSERT INTO projects (id, name, description, color, created_at, updated_at)
      VALUES (@id, @name, @description, @color, @now, @now)
      ON CONFLICT(id) DO UPDATE SET name=@name, description=@description, color=@color, updated_at=@now
    `).run({ ...input, id, now });
    return listProjects();
  };

  const deleteTask = (id: string): Task[] => {
    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    return listTasks();
  };

  const deleteProject = (id: string): Project[] => {
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    return listProjects();
  };

  const getSummary = (): TrackerSummary => {
    const today = new Date().toISOString().slice(0, 10);
    return db.prepare(`
      SELECT count(*) AS total,
        coalesce(sum(CASE WHEN status = 'done' THEN 1 ELSE 0 END), 0) AS completed,
        coalesce(sum(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), 0) AS inProgress,
        coalesce(sum(CASE WHEN status != 'done' AND due_date < @today THEN 1 ELSE 0 END), 0) AS overdue,
        coalesce(sum(CASE WHEN status != 'done' AND due_date = @today THEN 1 ELSE 0 END), 0) AS dueToday
      FROM tasks
    `).get({ today }) as TrackerSummary & {
      completed: number;
      inProgress: number;
      overdue: number;
      dueToday: number;
    };
  };

  const getPreferences = (): Preferences => {
    const row = db.prepare("SELECT value FROM preferences WHERE key = 'searchShortcut'").get() as { value: SearchShortcut } | undefined;
    return { searchShortcut: row?.value ?? "mod+k" };
  };

  const saveSearchShortcut = (shortcut: SearchShortcut): Preferences => {
    db.prepare(`
      INSERT INTO preferences (key, value) VALUES ('searchShortcut', @shortcut)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run({ shortcut });
    return getPreferences();
  };

  return { listTasks, listProjects, saveTask, saveProject, deleteTask, deleteProject, getSummary, getPreferences, saveSearchShortcut };
}
