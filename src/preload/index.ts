import { contextBridge, ipcRenderer } from "electron";
import type { TrackerApi } from "@shared/types";

const api: TrackerApi = {
  listTasks: () => ipcRenderer.invoke("tasks:list"),
  saveTask: (input) => ipcRenderer.invoke("tasks:save", input),
  deleteTask: (id) => ipcRenderer.invoke("tasks:delete", id),
  listProjects: () => ipcRenderer.invoke("projects:list"),
  saveProject: (input) => ipcRenderer.invoke("projects:save", input),
  deleteProject: (id) => ipcRenderer.invoke("projects:delete", id),
  getSummary: () => ipcRenderer.invoke("summary:get"),
  getPreferences: () => ipcRenderer.invoke("preferences:get"),
  saveSearchShortcut: (shortcut) => ipcRenderer.invoke("preferences:search-shortcut:set", shortcut),
};

contextBridge.exposeInMainWorld("tracker", api);
