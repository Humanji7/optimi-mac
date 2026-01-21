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
}

export function TerminalPanel({ agentId, projectPath }: TerminalPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const isSpawnedRef = useRef(false);

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
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    console.log(`[TerminalPanel] Terminal initialized for agent ${agentId}`);

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

  // Спавн PTY
  const spawnPty = useCallback(async () => {
    if (isSpawnedRef.current) {
      return;
    }

    try {
      const success = await window.electronAPI.terminalSpawn(agentId, projectPath);

      if (success) {
        isSpawnedRef.current = true;
        console.log(`[TerminalPanel] PTY spawned for agent ${agentId}`);
      } else {
        terminalRef.current?.writeln('\r\n\x1b[31mFailed to spawn terminal\x1b[0m');
      }
    } catch (error) {
      console.error(`[TerminalPanel] Failed to spawn PTY:`, error);
      terminalRef.current?.writeln(`\r\n\x1b[31mError: ${error}\x1b[0m`);
    }
  }, [agentId, projectPath]);

  // Подписка на данные от PTY
  useEffect(() => {
    const unsubscribeData = window.electronAPI.onTerminalData((data) => {
      if (data.agentId === agentId && terminalRef.current) {
        terminalRef.current.write(data.data);
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

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '200px',
        backgroundColor: '#1e1e1e',
      }}
    />
  );
}
