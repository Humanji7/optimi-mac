/**
 * Preload Script
 *
 * Purpose: Безопасный bridge между main и renderer процессами
 * Security: Использует contextBridge для изоляции, не даёт прямой доступ к Node APIs
 */

import { contextBridge, ipcRenderer } from 'electron';

// Типы для window.electronAPI
export interface ElectronAPI {
  getAppInfo: () => Promise<{ version: string; name: string; platform: string }>;

  // Dialog
  selectFolder: () => Promise<string | null>;

  // Agent management
  spawnAgent: (options: {
    role: string;
    projectName: string;
    projectPath: string;
    command?: string;
  }) => Promise<unknown>;
  killAgent: (id: string) => Promise<void>;
  listAgents: () => Promise<unknown[]>;
  sendCommand: (id: string, command: string) => Promise<void>;
  pauseAll: () => Promise<{ paused: number; errors: string[] }>;

  // Agent event listeners - возвращают функцию отписки
  onAgentSpawned: (callback: (agent: unknown) => void) => () => void;
  onAgentUpdated: (callback: (data: unknown) => void) => () => void;
  onAgentKilled: (callback: (data: unknown) => void) => () => void;
  onAgentError: (callback: (data: unknown) => void) => () => void;
  onHealthChecked: (callback: (data: unknown) => void) => () => void;

  // Terminal (PTY)
  terminalSpawn: (agentId: string, cwd?: string) => Promise<boolean>;
  terminalAttachTmux: (agentId: string, tmuxSession: string) => Promise<boolean>;
  terminalWrite: (agentId: string, data: string) => Promise<boolean>;
  terminalResize: (agentId: string, cols: number, rows: number) => Promise<boolean>;
  terminalKill: (agentId: string) => Promise<boolean>;
  onTerminalData: (callback: (data: { agentId: string; data: string }) => void) => () => void;
  onTerminalExit: (callback: (data: { agentId: string; exitCode: number; signal?: number }) => void) => () => void;

  // Legacy
  onAgentUpdate: (callback: (data: unknown) => void) => void;

  // Debug
  debugLog: (level: string, ...args: unknown[]) => void;
}

// Expose safe API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Get app info from main process
  getAppInfo: (): Promise<{ version: string; name: string; platform: string }> => {
    return ipcRenderer.invoke('app:ready');
  },

  // Dialog - выбор папки
  selectFolder: (): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:selectFolder');
  },

  // Agent management
  spawnAgent: (options): Promise<unknown> => {
    return ipcRenderer.invoke('agent:spawn', options);
  },

  killAgent: (id: string): Promise<void> => {
    return ipcRenderer.invoke('agent:kill', id);
  },

  listAgents: (): Promise<unknown[]> => {
    return ipcRenderer.invoke('agent:list');
  },

  sendCommand: (id: string, command: string): Promise<void> => {
    return ipcRenderer.invoke('agent:send-command', id, command);
  },

  pauseAll: (): Promise<{ paused: number; errors: string[] }> => {
    return ipcRenderer.invoke('agent:pause-all');
  },

  // Agent event listeners - возвращают функцию отписки
  onAgentSpawned: (callback: (agent: unknown) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, agent: unknown) => callback(agent);
    ipcRenderer.on('agent:spawned', handler);
    return () => ipcRenderer.removeListener('agent:spawned', handler);
  },

  onAgentUpdated: (callback: (data: unknown) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data);
    ipcRenderer.on('agent:updated', handler);
    return () => ipcRenderer.removeListener('agent:updated', handler);
  },

  onAgentKilled: (callback: (data: unknown) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data);
    ipcRenderer.on('agent:killed', handler);
    return () => ipcRenderer.removeListener('agent:killed', handler);
  },

  onAgentError: (callback: (data: unknown) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data);
    ipcRenderer.on('agent:error', handler);
    return () => ipcRenderer.removeListener('agent:error', handler);
  },

  onHealthChecked: (callback: (data: unknown) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data);
    ipcRenderer.on('health:checked', handler);
    return () => ipcRenderer.removeListener('health:checked', handler);
  },

  // Terminal (PTY)
  terminalSpawn: (agentId: string, cwd?: string): Promise<boolean> => {
    return ipcRenderer.invoke('terminal:spawn', agentId, cwd);
  },

  terminalAttachTmux: (agentId: string, tmuxSession: string): Promise<boolean> => {
    return ipcRenderer.invoke('terminal:attach-tmux', agentId, tmuxSession);
  },

  terminalWrite: (agentId: string, data: string): Promise<boolean> => {
    return ipcRenderer.invoke('terminal:write', agentId, data);
  },

  terminalResize: (agentId: string, cols: number, rows: number): Promise<boolean> => {
    return ipcRenderer.invoke('terminal:resize', agentId, cols, rows);
  },

  terminalKill: (agentId: string): Promise<boolean> => {
    return ipcRenderer.invoke('terminal:kill', agentId);
  },

  onTerminalData: (callback: (data: { agentId: string; data: string }) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { agentId: string; data: string }) => callback(data);
    ipcRenderer.on('terminal:data', handler);
    return () => ipcRenderer.removeListener('terminal:data', handler);
  },

  onTerminalExit: (callback: (data: { agentId: string; exitCode: number; signal?: number }) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { agentId: string; exitCode: number; signal?: number }) => callback(data);
    ipcRenderer.on('terminal:exit', handler);
    return () => ipcRenderer.removeListener('terminal:exit', handler);
  },

  // Legacy - Subscribe to agent updates
  onAgentUpdate: (callback: (data: unknown) => void): void => {
    ipcRenderer.on('agent:update', (_event, data) => {
      callback(data);
    });
  },

  // Debug logging to main process
  debugLog: (level: string, ...args: unknown[]): void => {
    ipcRenderer.send('debug:log', level, ...args);
  },
} satisfies ElectronAPI);
