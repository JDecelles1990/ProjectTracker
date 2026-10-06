import Database from "better-sqlite3";
import { migrate } from "./schema";

export function createTestDatabase(): Database.Database {
  const db = new Database(":memory:");
  migrate(db);
  return db;
}

