/**
 * PTY Manager
 *
 * Purpose: Управление PTY процессами для терминалов агентов
 * Responsibilities:
 * - Spawn/kill PTY процессов
 * - Маршрутизация данных между PTY и renderer
 * - Управление lifecycle
 */

import * as pty from 'node-pty';
import { BrowserWindow } from 'electron';
import * as os from 'os';

interface PtyProcess {
  pty: pty.IPty;
  agentId: string;
}

const DEFAULT_SHELL = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/zsh';
const DEFAULT_COLS = 80;
const DEFAULT_ROWS = 24;

class PtyManager {
  private processes: Map<string, PtyProcess> = new Map();
  private mainWindow: BrowserWindow | null = null;
  private onActivityCallback: ((agentId: string) => void) | null = null;

  /**
   * Устанавливает callback для уведомления об активности агента
   */
  setOnActivity(callback: (agentId: string) => void): void {
    this.onActivityCallback = callback;
  }

  /**
   * Устанавливает главное окно для отправки событий
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
    console.log('[PtyManager] Main window set');
  }

  /**
   * Создаёт новый PTY процесс для агента
   */
  spawn(agentId: string, cwd?: string): boolean {
    if (this.processes.has(agentId)) {
      console.warn(`[PtyManager] PTY already exists for agent: ${agentId}`);
      return false;
    }

    try {
      const ptyProcess = pty.spawn(DEFAULT_SHELL, [], {
        name: 'xterm-256color',
        cols: DEFAULT_COLS,
        rows: DEFAULT_ROWS,
        cwd: cwd || process.env.HOME || '/',
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
        },
      });

      // Обработка данных от PTY
      ptyProcess.onData((data: string) => {
        this.sendToRenderer('terminal:data', { agentId, data });
        // Уведомляем об активности
        this.onActivityCallback?.(agentId);
      });

      // Обработка выхода
      ptyProcess.onExit(({ exitCode, signal }) => {
        console.log(`[PtyManager] PTY exited for agent ${agentId}: code=${exitCode}, signal=${signal}`);
        this.processes.delete(agentId);
        this.sendToRenderer('terminal:exit', { agentId, exitCode, signal });
      });

      this.processes.set(agentId, { pty: ptyProcess, agentId });

      console.log(`[PtyManager] PTY spawned for agent ${agentId}, shell=${DEFAULT_SHELL}, cwd=${cwd}`);
      return true;
    } catch (error) {
      console.error(`[PtyManager] Failed to spawn PTY for agent ${agentId}:`, error);
      return false;
    }
  }

  /**
   * Подключается к существующему tmux session
   */
  attachToTmux(agentId: string, tmuxSession: string): boolean {
    if (this.processes.has(agentId)) {
      console.warn(`[PtyManager] PTY already exists for agent: ${agentId}`);
      return false;
    }

    try {
      // Spawn PTY с командой attach к tmux session
      // -d флаг отключает другие клиенты от сессии
      const ptyProcess = pty.spawn('tmux', ['attach', '-d', '-t', tmuxSession], {
        name: 'xterm-256color',
        cols: DEFAULT_COLS,
        rows: DEFAULT_ROWS,
        cwd: process.env.HOME || '/',
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
        },
      });

      // Обработка данных от PTY
      ptyProcess.onData((data: string) => {
        this.sendToRenderer('terminal:data', { agentId, data });
        // Уведомляем об активности
        this.onActivityCallback?.(agentId);
      });

      // Обработка выхода
      ptyProcess.onExit(({ exitCode, signal }) => {
        console.log(`[PtyManager] PTY detached from tmux ${tmuxSession} for agent ${agentId}: code=${exitCode}, signal=${signal}`);
        this.processes.delete(agentId);
        this.sendToRenderer('terminal:exit', { agentId, exitCode, signal });
      });

      this.processes.set(agentId, { pty: ptyProcess, agentId });

      console.log(`[PtyManager] PTY attached to tmux session ${tmuxSession} for agent ${agentId}`);
      return true;
    } catch (error) {
      console.error(`[PtyManager] Failed to attach PTY to tmux session ${tmuxSession} for agent ${agentId}:`, error);
      return false;
    }
  }

  /**
   * Отправляет данные в PTY
   */
  write(agentId: string, data: string): boolean {
    const proc = this.processes.get(agentId);

    if (!proc) {
      console.warn(`[PtyManager] No PTY found for agent: ${agentId}`);
      return false;
    }

    proc.pty.write(data);
    return true;
  }

  /**
   * Изменяет размер PTY
   */
  resize(agentId: string, cols: number, rows: number): boolean {
    const proc = this.processes.get(agentId);

    if (!proc) {
      console.warn(`[PtyManager] No PTY found for agent: ${agentId}`);
      return false;
    }

    proc.pty.resize(cols, rows);
    console.log(`[PtyManager] PTY resized for agent ${agentId}: ${cols}x${rows}`);
    return true;
  }

  /**
   * Убивает PTY процесс
   */
  kill(agentId: string): boolean {
    const proc = this.processes.get(agentId);

    if (!proc) {
      console.warn(`[PtyManager] No PTY found for agent: ${agentId}`);
      return false;
    }

    proc.pty.kill();
    this.processes.delete(agentId);

    console.log(`[PtyManager] PTY killed for agent ${agentId}`);
    return true;
  }

  /**
   * Проверяет, существует ли PTY для агента
   */
  hasPty(agentId: string): boolean {
    return this.processes.has(agentId);
  }

  /**
   * Отправляет данные в renderer
   */
  private sendToRenderer(channel: string, data: unknown): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  /**
   * Убивает все PTY процессы
   */
  killAll(): void {
    for (const [agentId, proc] of this.processes) {
      proc.pty.kill();
      console.log(`[PtyManager] PTY killed for agent ${agentId}`);
    }

    this.processes.clear();
    console.log('[PtyManager] All PTY processes killed');
  }

  /**
   * Получает количество активных PTY
   */
  getActiveCount(): number {
    return this.processes.size;
  }
}

// Singleton instance
export const ptyManager = new PtyManager();
