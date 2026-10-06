import Database from "better-sqlite3";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { migrate } from "./schema";
import { createRepositories } from "./repositories";

describe("preference persistence", () => {
  it("retains the selected search shortcut after closing and reopening the database", () => {
    const directory = mkdtempSync(join(tmpdir(), "projecttracker-preferences-"));
    const databasePath = join(directory, "tracker.sqlite");
    let db: Database.Database | undefined;
    try {
      db = new Database(databasePath);
      migrate(db);
      expect(createRepositories(db).saveSearchShortcut("mod+shift+k")).toEqual({ searchShortcut: "mod+shift+k", theme: "light" });
      expect(createRepositories(db).saveTheme("dark")).toEqual({ searchShortcut: "mod+shift+k", theme: "dark" });
      db.close();
      db = undefined;

      db = new Database(databasePath);
      migrate(db);
      expect(createRepositories(db).getPreferences()).toEqual({ searchShortcut: "mod+shift+k", theme: "dark" });
    } finally {
      db?.close();
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
