import { app } from "electron";
import Database from "better-sqlite3";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { migrate } from "./schema";

let database: Database.Database | undefined;

export function getDatabase(path = getDatabasePath()): Database.Database {
  if (!database) {
    mkdirSync(dirname(path), { recursive: true });
    database = new Database(path);
    database.pragma("journal_mode = WAL");
    database.pragma("foreign_keys = ON");
    migrate(database);
  }
  return database;
}

function getDatabasePath(): string {
  const userDataPath = app.getPath("userData");
  const databasePath = join(userDataPath, "projecttracker.sqlite");
  if (existsSync(databasePath)) return databasePath;

  const previousDatabasePaths = [
    join(app.getPath("appData"), "personal-tracker", "daymark.sqlite"),
    join(userDataPath, "daymark.sqlite"),
  ];
  const previousDatabasePath = previousDatabasePaths.find(existsSync);
  if (previousDatabasePath) {
    mkdirSync(dirname(databasePath), { recursive: true });
    copyFileSync(previousDatabasePath, databasePath);
    for (const suffix of ["-wal", "-shm"]) {
      const sidecar = `${previousDatabasePath}${suffix}`;
      if (existsSync(sidecar)) copyFileSync(sidecar, `${databasePath}${suffix}`);
    }
  }

  return databasePath;
}

export function closeDatabase(): void {
  database?.close();
  database = undefined;
}

export { migrate } from "./schema";
