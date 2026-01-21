/**
 * Detail Panel Component
 *
 * Purpose: Боковая панель для отображения деталей выбранного агента
 * Responsibilities:
 * - Отображение информации об агенте (роль, статус, метрики, проект)
 * - Кнопка Kill для завершения агента
 * - Отправка команд агенту
 */

import { useState, FormEvent } from 'react';
import type { AgentStatus } from '../pixi/types';
import { TerminalPanel } from './TerminalPanel';
import { getSeverity, SEVERITY_COLORS, SEVERITY_ICONS } from '../utils/severity';

/**
 * Полный интерфейс агента (зеркало из main/agents/types.ts)
 * Используется для типизации данных агента в UI
 */
export interface Agent {
  id: string;
  role: string;
  status: AgentStatus;
  project: {
    name: string;
    path: string;
  };
  process: {
    tmuxSession: string;
    pid: number | null;
  };
  metrics: {
    health: string;
    uptime: number;
  };
}

interface DetailPanelProps {
  agent: Agent | null;
  onClose: () => void;
  onKill: (id: string) => void;
  onSendCommand: (id: string, command: string) => void;
}

/**
 * Форматирует uptime в человекочитаемый формат
 * @param seconds - Время работы в секундах
 * @returns Строка вида "5m 32s" или "1h 23m"
 */
function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Возвращает emoji для роли агента
 */
function getRoleEmoji(role: string): string {
  const emojiMap: Record<string, string> = {
    Architect: '🏰',
    Coder: '💻',
    Tester: '🧪',
    Reviewer: '👁️',
  };

  return emojiMap[role] || '🤖';
}

/**
 * Возвращает цвет для статуса агента
 */
function getStatusColor(status: AgentStatus): string {
  const colorMap: Record<AgentStatus, string> = {
    idle: '#3b82f6', // blue
    working: '#22c55e', // green
    error: '#ef4444', // red
    paused: '#6b7280', // gray
  };

  return colorMap[status];
}

export function DetailPanel({ agent, onClose, onKill, onSendCommand }: DetailPanelProps) {
  const [command, setCommand] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);

  if (!agent) {
    return null;
  }

  const handleSendCommand = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!command.trim()) {
      return;
    }

    onSendCommand(agent.id, command.trim());
    setCommand(''); // Очистить поле после отправки
  };

  const handleKill = () => {
    if (confirm(`Kill agent "${agent.id}"?`)) {
      onKill(agent.id);
    }
  };

  return (
    <div style={styles.panel}>
      {/* Header с кнопкой закрытия */}
      <div style={styles.header}>
        <h3 style={styles.title}>Agent Details</h3>
        <button onClick={onClose} style={styles.closeButton} aria-label="Close panel">
          ✕
        </button>
      </div>

      {/* Основная информация */}
      <div style={styles.content}>
        {/* Роль */}
        <div style={styles.section}>
          <div style={styles.label}>Role</div>
          <div style={styles.value}>
            {getRoleEmoji(agent.role)} {agent.role}
          </div>
        </div>

        {/* Статус */}
        <div style={styles.section}>
          <div style={styles.label}>Status</div>
          <div style={styles.statusRow}>
            <div
              style={{
                ...styles.statusIndicator,
                backgroundColor: getStatusColor(agent.status),
              }}
            />
            <span style={styles.value}>{agent.status}</span>
          </div>
        </div>

        {/* Метрики */}
        <div style={styles.section}>
          <div style={styles.label}>Metrics</div>
          <div style={styles.metricsGrid}>
            <div>
              <div style={styles.metricLabel}>Uptime</div>
              <div style={styles.metricValue}>{formatUptime(agent.metrics?.uptime ?? 0)}</div>
            </div>
            <div>
              <div style={styles.metricLabel}>Health</div>
              <div style={styles.metricValue}>{agent.metrics?.health ?? 'N/A'}</div>
            </div>
          </div>

          {/* Severity indicator */}
          {(() => {
            const severity = getSeverity(agent.metrics?.health, agent.status);
            if (!severity) return null;
            return (
              <div style={{
                ...styles.metricItem,
                backgroundColor: `${SEVERITY_COLORS[severity]}20`,
                border: `1px solid ${SEVERITY_COLORS[severity]}`,
                borderRadius: 4,
                padding: '8px 12px',
                marginTop: 8,
              }}>
                <span style={{ color: SEVERITY_COLORS[severity], fontWeight: 600 }}>
                  {SEVERITY_ICONS[severity]} {severity.toUpperCase()}
                </span>
                <span style={{ color: '#ccc', marginLeft: 8, fontSize: 12 }}>
                  {severity === 'blocker' && 'Critical issue - agent cannot function'}
                  {severity === 'warning' && 'Temporary issue - monitoring'}
                  {severity === 'info' && 'Unknown state - needs attention'}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Проект */}
        <div style={styles.section}>
          <div style={styles.label}>Project</div>
          <div style={styles.projectName}>{agent.project?.name ?? 'Unknown'}</div>
          <div style={styles.projectPath}>{agent.project?.path ?? 'N/A'}</div>
        </div>

        {/* Кнопка Kill */}
        <button onClick={handleKill} style={styles.killButton}>
          Kill Agent
        </button>

        {/* Форма отправки команды */}
        <div style={styles.section}>
          <div style={styles.label}>Send Command</div>
          <form onSubmit={handleSendCommand} style={styles.commandForm}>
            <input
              type="text"
              placeholder="Enter command..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              style={styles.commandInput}
            />
            <button type="submit" style={styles.sendButton}>
              Send
            </button>
          </form>
        </div>

        {/* Терминал */}
        <div style={styles.section}>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            style={styles.terminalToggle}
          >
            {showTerminal ? '▼ Hide Terminal' : '▶ Show Terminal'}
          </button>
        </div>
      </div>

      {/* Terminal Panel */}
      {showTerminal && (
        <div style={styles.terminalContainer}>
          <TerminalPanel
            agentId={agent.id}
            projectPath={agent.project?.path}
            tmuxSession={agent.process?.tmuxSession}
          />
        </div>
      )}
    </div>
  );
}

// Inline styles (темная тема)
const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#1e1e1e',
    borderLeft: '1px solid #444444',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #444444',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#ffffff',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#cccccc',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
    lineHeight: 1,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  },
  section: {
    marginBottom: '20px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#888888',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  value: {
    fontSize: '14px',
    color: '#ffffff',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#888888',
    marginBottom: '4px',
  },
  metricValue: {
    fontSize: '14px',
    color: '#ffffff',
    fontWeight: 500,
  },
  metricItem: {
    display: 'block',
  },
  projectName: {
    fontSize: '14px',
    color: '#ffffff',
    fontWeight: 500,
    marginBottom: '4px',
  },
  projectPath: {
    fontSize: '12px',
    color: '#888888',
    wordBreak: 'break-all',
  },
  killButton: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#ffffff',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  commandForm: {
    display: 'flex',
    gap: '8px',
  },
  commandInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '13px',
    backgroundColor: '#2d2d2d',
    color: '#ffffff',
    border: '1px solid #444444',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  sendButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#ffffff',
    backgroundColor: '#007acc',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  terminalToggle: {
    width: '100%',
    padding: '10px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#cccccc',
    backgroundColor: '#2d2d2d',
    border: '1px solid #444444',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  terminalContainer: {
    height: '300px',
    borderTop: '1px solid #444444',
    overflow: 'hidden',
  },
};
