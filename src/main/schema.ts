import Database from "better-sqlite3";

export function migrate(db: Database.Database): void {
  const version = Number(db.pragma("user_version", { simple: true }));
  if (version < 1) {
    db.transaction(() => {
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
        PRAGMA user_version = 1;
      `);
    })();
  }
  if (version < 2) {
    db.transaction(() => {
      db.exec(`
        CREATE TABLE preferences (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
        INSERT INTO preferences (key, value) VALUES ('searchShortcut', 'mod+k');
        PRAGMA user_version = 2;
      `);
    })();
  }
  if (version < 3) {
    db.transaction(() => {
      db.exec(`
        INSERT INTO preferences (key, value) VALUES ('theme', 'light');
        PRAGMA user_version = 3;
      `);
    })();
  }
}
