/**
 * Main Process Entry Point
 *
 * Purpose: Electron main process - создаёт окно приложения, управляет lifecycle, обрабатывает IPC
 * Dependencies: electron, path, agents
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { agentManager, agentEvents } from './agents';

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
 * Event Forwarding - Forward agent events to renderer
 */
function setupEventForwarding(): void {
  agentEvents.on('agent:spawned', (agent) => {
    mainWindow?.webContents.send('agent:spawned', agent);
  });

  agentEvents.on('agent:updated', (data) => {
    mainWindow?.webContents.send('agent:updated', data);
  });

  agentEvents.on('agent:killed', (data) => {
    mainWindow?.webContents.send('agent:killed', data);
  });

  agentEvents.on('agent:error', (data) => {
    mainWindow?.webContents.send('agent:error', data);
  });

  agentEvents.on('health:checked', (data) => {
    mainWindow?.webContents.send('health:checked', data);
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

// Handler: spawn agent
ipcMain.handle('agent:spawn', async (_, options) => {
  return await agentManager.spawnAgent(options);
});

// Handler: kill agent
ipcMain.handle('agent:kill', async (_, id) => {
  return await agentManager.killAgent(id);
});

// Handler: list agents
ipcMain.handle('agent:list', () => {
  return agentManager.getAllAgents();
});

// Handler: send command to agent
ipcMain.handle('agent:send-command', async (_, id, command) => {
  return await agentManager.sendCommand(id, command);
});

/**
 * App Lifecycle
 */

app.whenReady().then(async () => {
  // Initialize AgentManager
  await agentManager.init();

  // Setup event forwarding
  setupEventForwarding();

  // Create window
  createWindow();

  app.on('activate', () => {
    // macOS: re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Graceful shutdown
app.on('before-quit', async (event) => {
  event.preventDefault();
  await agentManager.shutdown();
  app.exit(0);
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
