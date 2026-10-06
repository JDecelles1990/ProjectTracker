import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "node:path";
import { getDatabase } from "./database";
import { createRepositories } from "./repositories";
import { parseId, parseProjectInput, parseSearchShortcut, parseTaskInput } from "./validation";

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
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: "#f7f8fa",
    title: "Daymark — Personal Tracker",
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
