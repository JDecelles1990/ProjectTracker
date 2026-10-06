import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { getDatabase } from "./database";
import { createRepositories } from "./repositories";
import { parseId, parseProjectInput, parseSearchShortcut, parseTaskInput, parseTheme } from "./validation";

function registerHandlers(): void {
  const repository = createRepositories(getDatabase());
  ipcMain.handle("tasks:list", () => repository.listTasks());
  ipcMain.handle("tasks:save", (_event, input: unknown) => repository.saveTask(parseTaskInput(input)));
  ipcMain.handle("tasks:delete", (_event, id: unknown) => repository.deleteTask(parseId(id)));
  ipcMain.handle("projects:list", () => repository.listProjects());
  ipcMain.handle("projects:save", (_event, input: unknown) => repository.saveProject(parseProjectInput(input)));
  ipcMain.handle("projects:delete", (_event, id: unknown) => repository.deleteProject(parseId(id)));
  ipcMain.handle("summary:get", () => repository.getSummary());
  ipcMain.handle("preferences:get", () => repository.getPreferences());
  ipcMain.handle("preferences:search-shortcut:set", (_event, value: unknown) => repository.saveSearchShortcut(parseSearchShortcut(value)));
  ipcMain.handle("preferences:theme:set", (_event, value: unknown) => repository.saveTheme(parseTheme(value)));
  ipcMain.handle("backup:export", async () => {
    const backup = repository.createBackup();
    const defaultPath = join(app.getPath("documents"), `projecttracker-backup-${new Date().toISOString().slice(0, 10)}.json`);
    const result = await dialog.showSaveDialog({
      title: "Export ProjectTracker backup",
      defaultPath,
      buttonLabel: "Save backup",
      filters: [{ name: "JSON backup", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePath) return { canceled: true as const };

    await writeFile(result.filePath, `${JSON.stringify(backup, null, 2)}\n`, { encoding: "utf8" });
    return {
      canceled: false as const,
      fileName: basename(result.filePath),
      projectCount: backup.projects.length,
      taskCount: backup.tasks.length,
    };
  });
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: "#f7f8fa",
    title: "ProjectTracker — Personal Task Tracker",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  registerHandlers();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
