/**
 * Terminal Panel Component
 *
 * Purpose: xterm.js терминал для агента
 * Responsibilities:
 * - Инициализация xterm.js
 * - Связь с PTY через IPC
 * - Обработка ввода/вывода
 */

import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import 'xterm/css/xterm.css';

interface TerminalPanelProps {
  agentId: string;
  projectPath?: string;
  tmuxSession?: string;
}

export function TerminalPanel({ agentId, projectPath, tmuxSession }: TerminalPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const isSpawnedRef = useRef(false);
  const pendingDataRef = useRef<string[]>([]); // Buffer for data before terminal ready
  const isReadyRef = useRef(false);

  // Инициализация терминала
  const initTerminal = useCallback(() => {
    if (!containerRef.current || terminalRef.current) {
      return;
    }

    // Создаём терминал
    const terminal = new Terminal({
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#ffffff',
        cursorAccent: '#1e1e1e',
        selectionBackground: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      cursorBlink: true,
      scrollback: 5000,
      convertEol: true,
    });

    // Добавляем addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    // Открываем терминал в контейнере
    terminal.open(containerRef.current);

    // Fit with retry if dimensions are 0
    const tryFit = (attempts = 0) => {
      try {
        fitAddon.fit();
        if ((terminal.cols === 0 || terminal.rows === 0) && attempts < 10) {
          setTimeout(() => tryFit(attempts + 1), 100);
        }
      } catch {
        if (attempts < 10) {
          setTimeout(() => tryFit(attempts + 1), 100);
        }
      }
    };
    tryFit();
    terminal.focus();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Flush pending data
    if (pendingDataRef.current.length > 0) {
      for (const data of pendingDataRef.current) {
        terminal.write(data);
      }
      pendingDataRef.current = [];
    }

    isReadyRef.current = true;

    // Спавним PTY
    spawnPty();

    // Обработка ввода
    terminal.onData((data) => {
      window.electronAPI.terminalWrite(agentId, data);
    });

    // Обработка resize
    terminal.onResize(({ cols, rows }) => {
      window.electronAPI.terminalResize(agentId, cols, rows);
    });
  }, [agentId]);

  // Спавн PTY или attach к tmux session
  const spawnPty = useCallback(async () => {
    if (isSpawnedRef.current) {
      return;
    }

    try {
      let success: boolean;

      if (tmuxSession) {
        success = await window.electronAPI.terminalAttachTmux(agentId, tmuxSession);
      } else {
        success = await window.electronAPI.terminalSpawn(agentId, projectPath);
      }

      if (success) {
        isSpawnedRef.current = true;
      } else {
        const errorMsg = tmuxSession
          ? `Failed to attach to tmux session ${tmuxSession}`
          : 'Failed to spawn terminal';
        terminalRef.current?.writeln(`\r\n\x1b[31m${errorMsg}\x1b[0m`);
      }
    } catch (error) {
      terminalRef.current?.writeln(`\r\n\x1b[31mError: ${error}\x1b[0m`);
    }
  }, [agentId, projectPath, tmuxSession]);

  // Подписка на данные от PTY
  useEffect(() => {
    const unsubscribeData = window.electronAPI.onTerminalData((data) => {
      if (data.agentId === agentId) {
        if (isReadyRef.current && terminalRef.current) {
          terminalRef.current.write(data.data);
        } else {
          // Buffer data until terminal is ready
          pendingDataRef.current.push(data.data);
        }
      }
    });

    const unsubscribeExit = window.electronAPI.onTerminalExit((data) => {
      if (data.agentId === agentId && terminalRef.current) {
        terminalRef.current.writeln(`\r\n\x1b[33mTerminal exited with code ${data.exitCode}\x1b[0m`);
        isSpawnedRef.current = false;
      }
    });

    return () => {
      unsubscribeData();
      unsubscribeExit();
    };
  }, [agentId]);

  // Инициализация при монтировании
  useEffect(() => {
    initTerminal();

    return () => {
      // Cleanup
      isReadyRef.current = false;
      pendingDataRef.current = [];

      if (terminalRef.current) {
        terminalRef.current.dispose();
        terminalRef.current = null;
      }

      // Kill PTY
      if (isSpawnedRef.current) {
        window.electronAPI.terminalKill(agentId);
        isSpawnedRef.current = false;
      }
    };
  }, [agentId, initTerminal]);

  // Обработка resize контейнера
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Фокус терминала при клике
  const handleClick = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.focus();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '200px',
        backgroundColor: '#1e1e1e',
      }}
    />
  );
}
