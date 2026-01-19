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

  // Agent event listeners
  onAgentSpawned: (callback: (agent: unknown) => void) => void;
  onAgentUpdated: (callback: (data: unknown) => void) => void;
  onAgentKilled: (callback: (data: unknown) => void) => void;
  onAgentError: (callback: (data: unknown) => void) => void;
  onHealthChecked: (callback: (data: unknown) => void) => void;

  // Legacy
  onAgentUpdate: (callback: (data: unknown) => void) => void;
}

// Expose safe API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Get app info from main process
  getAppInfo: (): Promise<{ version: string; name: string; platform: string }> => {
    return ipcRenderer.invoke('app:ready');
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

  // Agent event listeners
  onAgentSpawned: (callback: (agent: unknown) => void): void => {
    ipcRenderer.on('agent:spawned', (_event, agent) => {
      callback(agent);
    });
  },

  onAgentUpdated: (callback: (data: unknown) => void): void => {
    ipcRenderer.on('agent:updated', (_event, data) => {
      callback(data);
    });
  },

  onAgentKilled: (callback: (data: unknown) => void): void => {
    ipcRenderer.on('agent:killed', (_event, data) => {
      callback(data);
    });
  },

  onAgentError: (callback: (data: unknown) => void): void => {
    ipcRenderer.on('agent:error', (_event, data) => {
      callback(data);
    });
  },

  onHealthChecked: (callback: (data: unknown) => void): void => {
    ipcRenderer.on('health:checked', (_event, data) => {
      callback(data);
    });
  },

  // Legacy - Subscribe to agent updates
  onAgentUpdate: (callback: (data: unknown) => void): void => {
    ipcRenderer.on('agent:update', (_event, data) => {
      callback(data);
    });
  },
} satisfies ElectronAPI);
