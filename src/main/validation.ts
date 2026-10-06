import { SEARCH_SHORTCUTS, TASK_PRIORITIES, TASK_STATUSES, THEMES } from "@shared/types";
import type { ProjectInput, SearchShortcut, TaskInput, Theme } from "@shared/types";

function record(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected an object.");
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, name: string, max: number): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > max) {
    throw new Error(`${name} must be between 1 and ${max} characters.`);
  }
  return value.trim();
}

function optionalText(value: unknown, name: string, max: number): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > max) throw new Error(`${name} is too long.`);
  return value.trim();
}

function optionalId(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  return text(value, "ID", 80);
}

export function parseTaskInput(value: unknown): TaskInput {
  const data = record(value);
  const projectId = data.projectId === null || data.projectId === "" ? null : text(data.projectId, "Project", 80);
  if (!TASK_STATUSES.includes(data.status as TaskInput["status"])) throw new Error("Choose a valid task status.");
  if (!TASK_PRIORITIES.includes(data.priority as TaskInput["priority"])) throw new Error("Choose a valid task priority.");
  const dueDate = data.dueDate === null || data.dueDate === "" ? null : text(data.dueDate, "Due date", 10);
  if (dueDate) {
    const parsedDate = new Date(`${dueDate}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== dueDate) {
      throw new Error("Due date must be a real date in YYYY-MM-DD format.");
    }
  }
  return {
    id: optionalId(data.id),
    projectId,
    title: text(data.title, "Title", 200),
    description: optionalText(data.description, "Description", 10_000),
    status: data.status as TaskInput["status"],
    priority: data.priority as TaskInput["priority"],
    dueDate,
  };
}

export function parseProjectInput(value: unknown): ProjectInput {
  const data = record(value);
  const color = data.color === undefined ? "#5b68d8" : text(data.color, "Color", 7);
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) throw new Error("Choose a valid project color.");
  return {
    id: optionalId(data.id),
    name: text(data.name, "Project name", 100),
    description: optionalText(data.description, "Description", 2_000),
    color,
  };
}

export function parseId(value: unknown): string {
  return text(value, "ID", 80);
}

export function parseSearchShortcut(value: unknown): SearchShortcut {
  if (typeof value !== "string" || !SEARCH_SHORTCUTS.includes(value as SearchShortcut)) {
    throw new Error("Choose a supported search shortcut.");
  }
  return value as SearchShortcut;
}

export function parseTheme(value: unknown): Theme {
  if (typeof value !== "string" || !THEMES.includes(value as Theme)) {
    throw new Error("Choose a supported appearance theme.");
  }
  return value as Theme;
}
