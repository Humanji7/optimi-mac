/**
 * Main Process Entry Point
 *
 * Purpose: Electron main process - создаёт окно приложения, управляет lifecycle, обрабатывает IPC
 * Dependencies: electron, path, agents
 */

import { app, BrowserWindow, ipcMain, globalShortcut, Menu, dialog } from 'electron';
import path from 'node:path';
import { agentManager, agentEvents } from './agents';
import { ptyManager } from './terminal/pty-manager';
import * as tmux from './tmux';

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
    mainWindow.webContents.openDevTools({ mode: 'detach' }); // Отдельное окно

    // Меню с DevTools
    const menu = Menu.buildFromTemplate([
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
        ],
      },
    ]);
    Menu.setApplicationMenu(menu);
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

// Handler: select folder dialog
ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: 'Select Project Folder',
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
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

// Handler: pause all agents
ipcMain.handle('agent:pause-all', async () => {
  return await agentManager.pauseAll();
});

// Handler: debug log from renderer
ipcMain.on('debug:log', (_, level, ...args) => {
  console.log(`[Renderer:${level}]`, ...args);
});

// Terminal IPC Handlers
ipcMain.handle('terminal:spawn', async (_, agentId: string, cwd?: string) => {
  return ptyManager.spawn(agentId, cwd);
});

ipcMain.handle('terminal:attach-tmux', async (_, agentId: string, tmuxSession: string) => {
  return ptyManager.attachToTmux(agentId, tmuxSession);
});

ipcMain.handle('terminal:write', async (_, agentId: string, data: string) => {
  return ptyManager.write(agentId, data);
});

ipcMain.handle('terminal:resize', async (_, agentId: string, cols: number, rows: number) => {
  return ptyManager.resize(agentId, cols, rows);
});

ipcMain.handle('terminal:kill', async (_, agentId: string) => {
  return ptyManager.kill(agentId);
});

// Terminal output capture
ipcMain.handle('terminal:capture', async (_, agentId: string, lines?: number) => {
  const agent = agentManager.getAgent(agentId);
  if (!agent) {
    return [];
  }

  try {
    const output = await tmux.capturePane(agent.process.tmuxSession, lines || 10);
    return output;
  } catch (error) {
    console.error(`[Main] Failed to capture terminal for ${agentId}:`, error);
    return [];
  }
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

  // Set mainWindow for ptyManager
  if (mainWindow) {
    ptyManager.setMainWindow(mainWindow);
  }

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
  ptyManager.killAll();
  await agentManager.shutdown();
  app.exit(0);
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
