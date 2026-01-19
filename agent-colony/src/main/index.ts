/**
 * Main Process Entry Point
 *
 * Purpose: Electron main process - создаёт окно приложения, управляет lifecycle, обрабатывает IPC
 * Dependencies: electron, path
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

/**
 * Создаёт главное окно приложения
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Security: enable context isolation
      nodeIntegration: false, // Security: disable node integration
    },
  });

  // Development: load from vite dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built files
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * IPC Handlers
 */

// Handler: get app info
ipcMain.handle('app:ready', async () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform,
  };
});

/**
 * App Lifecycle
 */

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // macOS: re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
