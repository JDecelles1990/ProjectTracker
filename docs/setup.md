# Setup and development

## Requirements

- Windows 10 or newer
- Node.js 20+ and npm
- On Windows, `better-sqlite3` may require the matching prebuilt native binary; if npm reports that it must compile from source, install the Visual Studio C++ Build Tools and Python 3, then retry `npm install`.

## Start the desktop app

```powershell
npm install
npm run dev
```

`electron-vite` starts the renderer dev server and Electron main process together. The app stores its database under Electron's resolved `userData` directory (normally `%APPDATA%\ProjectTracker\projecttracker.sqlite` on Windows). On first launch after the app rename, ProjectTracker copies the previous `personal-tracker\daymark.sqlite` database into the new location without removing the original.

## Checks

```powershell
npm test
npm run typecheck
npm run build
```

`npm test` exercises migrations, repository CRUD/relations/summary, preferences, theme validation, and backup snapshot behavior using in-memory SQLite. `npm run build` produces the Electron bundles under `out/`.

## Troubleshooting

- **Electron reports `Electron uninstall` or cannot start:** its platform runtime was not installed. Ensure the Electron install script is allowed, then run `npm rebuild electron`. If the binary is still missing, retry `npm install` with network access to GitHub release assets; verify `node_modules/electron/path.txt` and `node_modules/electron/dist/electron.exe` exist on Windows.
- **Native module ABI mismatch:** `better-sqlite3` may have been built for system Node instead of Electron. From the project directory run `npx electron-rebuild --force --which-module better-sqlite3 --version 38.8.6` to rebuild it for this project's Electron version, then retry `npm run dev`. This switches the native module to Electron's ABI; to run Vitest afterward, rebuild the module for the installed Node runtime with `npm rebuild better-sqlite3`, then rebuild for Electron again before launching the app.
- **Database is locked:** close any other ProjectTracker process using the same user-data directory, then reopen the app. SQLite WAL mode allows ordinary concurrent reads and writes within one app instance.
- **Need a clean test database:** tests use `:memory:` and never touch the user's live database.

## Packaging

The development build is configured and validated by `electron-vite`. A distributable installer, app signing, and release automation are intentionally not configured in this MVP.
