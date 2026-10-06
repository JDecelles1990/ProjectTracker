export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export const SEARCH_SHORTCUTS = ["mod+k", "mod+shift+k", "mod+f"] as const;
export type SearchShortcut = (typeof SEARCH_SHORTCUTS)[number];
export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export interface Preferences {
  searchShortcut: SearchShortcut;
  theme: Theme;
}

export interface TrackerBackup {
  format: "projecttracker-backup";
  version: 1;
  exportedAt: string;
  projects: Project[];
  tasks: Task[];
  preferences: Preferences;
}

export type BackupExportResult =
  | { canceled: true }
  | { canceled: false; fileName: string; projectCount: number; taskCount: number };

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  completedTaskCount: number;
}

export interface Task {
  id: string;
  projectId: string | null;
  projectName: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  id?: string;
  projectId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
}

export interface ProjectInput {
  id?: string;
  name: string;
  description: string;
  color: string;
}

export interface TrackerSummary {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
}

export interface TrackerApi {
  listTasks(): Promise<Task[]>;
  saveTask(input: TaskInput): Promise<Task[]>;
  deleteTask(id: string): Promise<Task[]>;
  listProjects(): Promise<Project[]>;
  saveProject(input: ProjectInput): Promise<Project[]>;
  deleteProject(id: string): Promise<Project[]>;
  getSummary(): Promise<TrackerSummary>;
  getPreferences(): Promise<Preferences>;
  saveSearchShortcut(shortcut: SearchShortcut): Promise<Preferences>;
  saveTheme(theme: Theme): Promise<Preferences>;
  exportBackup(): Promise<BackupExportResult>;
}

declare global {
  interface Window {
    tracker: TrackerApi;
  }
}
