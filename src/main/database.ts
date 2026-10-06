import { app } from "electron";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { migrate } from "./schema";

let database: Database.Database | undefined;

export function getDatabase(path = join(app.getPath("userData"), "daymark.sqlite")): Database.Database {
  if (!database) {
    mkdirSync(dirname(path), { recursive: true });
    database = new Database(path);
    database.pragma("journal_mode = WAL");
    database.pragma("foreign_keys = ON");
    migrate(database);
  }
  return database;
}

export function closeDatabase(): void {
  database?.close();
  database = undefined;
}

export { migrate } from "./schema";
