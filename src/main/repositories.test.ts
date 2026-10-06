import { describe, expect, it } from "vitest";
import { createTestDatabase } from "./test-utils";
import { createRepositories } from "./repositories";

describe("tracker repositories", () => {
  it("creates, updates, filters and deletes project/task records", () => {
    const db = createTestDatabase();
    const repository = createRepositories(db);
    try {
      const [project] = repository.saveProject({ name: "Garden", description: "Spring plan", color: "#2468ac" });
      repository.saveTask({
        projectId: project.id, title: "Plant herbs", description: "", status: "todo", priority: "high", dueDate: null,
      });
      expect(repository.listProjects()[0]).toMatchObject({ name: "Garden", taskCount: 1, completedTaskCount: 0 });

      const task = repository.listTasks()[0];
      repository.saveTask({
        id: task.id, projectId: project.id, title: "Plant basil", description: "By the window",
        status: "done", priority: "low", dueDate: "2026-06-12",
      });
      expect(repository.listTasks()[0]).toMatchObject({ title: "Plant basil", status: "done", projectName: "Garden" });
      expect(repository.listProjects()[0].completedTaskCount).toBe(1);

      repository.deleteProject(project.id);
      expect(repository.listProjects()).toHaveLength(0);
      expect(repository.listTasks()[0].projectId).toBeNull();
      repository.deleteTask(task.id);
      expect(repository.listTasks()).toHaveLength(0);
    } finally {
      db.close();
    }
  });

  it("returns zeroed summary for an empty database", () => {
    const db = createTestDatabase();
    const repository = createRepositories(db);
    try {
      expect(repository.getSummary()).toMatchObject({ total: 0, completed: 0, inProgress: 0, overdue: 0, dueToday: 0 });
    } finally {
      db.close();
    }
  });

  it("loads the default search shortcut and persists preference changes", () => {
    const db = createTestDatabase();
    const repository = createRepositories(db);
    try {
      expect(repository.getPreferences()).toEqual({ searchShortcut: "mod+k" });
      expect(repository.saveSearchShortcut("mod+shift+k")).toEqual({ searchShortcut: "mod+shift+k" });
      expect(repository.getPreferences()).toEqual({ searchShortcut: "mod+shift+k" });
    } finally {
      db.close();
    }
  });
});
