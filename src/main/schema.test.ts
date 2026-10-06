import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migrate } from "./schema";

describe("database migrations", () => {
  it("upgrades version 1 databases without losing existing project or task data", () => {
    const db = new Database(":memory:");
    try {
      db.exec(`
        CREATE TABLE projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 100),
          description TEXT NOT NULL DEFAULT '',
          color TEXT NOT NULL DEFAULT '#5b68d8',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE tasks (
          id TEXT PRIMARY KEY,
          project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
          title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
          description TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')),
          priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
          due_date TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX tasks_status_idx ON tasks(status);
        CREATE INDEX tasks_project_id_idx ON tasks(project_id);
        CREATE INDEX tasks_due_date_idx ON tasks(due_date);
        INSERT INTO projects (id, name, description, color, created_at, updated_at)
          VALUES ('project-1', 'Garden', 'Spring plans', '#2468ac', '2026-01-01', '2026-01-01');
        INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, created_at, updated_at)
          VALUES ('task-1', 'project-1', 'Plant herbs', 'Start with basil', 'in_progress', 'high', '2026-02-01', '2026-01-01', '2026-01-01');
        PRAGMA user_version = 1;
      `);

      migrate(db);

      expect(Number(db.pragma("user_version", { simple: true }))).toBe(2);
      expect(db.prepare("SELECT id, name FROM projects").all()).toEqual([{ id: "project-1", name: "Garden" }]);
      expect(db.prepare("SELECT id, project_id, title, status FROM tasks").all()).toEqual([
        { id: "task-1", project_id: "project-1", title: "Plant herbs", status: "in_progress" },
      ]);
      expect(db.prepare("SELECT value FROM preferences WHERE key = 'searchShortcut'").get()).toEqual({ value: "mod+k" });

      migrate(db);
      expect(Number(db.pragma("user_version", { simple: true }))).toBe(2);
      expect(db.prepare("SELECT count(*) AS count FROM projects").get()).toEqual({ count: 1 });
    } finally {
      db.close();
    }
  });
});
