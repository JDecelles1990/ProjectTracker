import { describe, expect, it } from "vitest";
import { parseProjectInput, parseSearchShortcut, parseTaskInput, parseTheme } from "./validation";

describe("IPC input validation", () => {
  it("normalizes optional fields and accepts a valid task", () => {
    expect(parseTaskInput({
      title: "  Write docs  ", description: "", projectId: "", status: "todo", priority: "medium", dueDate: "",
    })).toMatchObject({ title: "Write docs", projectId: null, dueDate: null });
  });

  it("rejects invalid task state and impossible due dates", () => {
    expect(() => parseTaskInput({
      title: "Task", status: "blocked", priority: "high", projectId: null, description: "", dueDate: null,
    })).toThrow("valid task status");
    expect(() => parseTaskInput({
      title: "Task", status: "todo", priority: "high", projectId: null, description: "", dueDate: "2026-02-30",
    })).toThrow("real date");
  });

  it("rejects malformed project colors", () => {
    expect(() => parseProjectInput({ name: "Garden", color: "red" })).toThrow("valid project color");
  });

  it("accepts supported search shortcuts and rejects unknown values", () => {
    expect(parseSearchShortcut("mod+f")).toBe("mod+f");
    expect(() => parseSearchShortcut("alt+k")).toThrow("supported search shortcut");
  });

  it("accepts supported appearance themes and rejects unknown values", () => {
    expect(parseTheme("dark")).toBe("dark");
    expect(() => parseTheme("sepia")).toThrow("supported appearance theme");
  });
});
