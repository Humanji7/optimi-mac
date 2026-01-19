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
  onAgentUpdate: (callback: (data: unknown) => void) => void;
}

// Expose safe API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Get app info from main process
  getAppInfo: (): Promise<{ version: string; name: string; platform: string }> => {
    return ipcRenderer.invoke('app:ready');
  },

  // Subscribe to agent updates (для будущих events)
  onAgentUpdate: (callback: (data: unknown) => void): void => {
    ipcRenderer.on('agent:update', (_event, data) => {
      callback(data);
    });
  },
} satisfies ElectronAPI);
