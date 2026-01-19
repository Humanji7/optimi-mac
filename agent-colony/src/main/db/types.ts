/**
 * Database types for Agent Colony
 *
 * Определяет типы данных для работы с SQLite базой:
 * - AgentRecord: состояние агента
 * - MetricsSnapshot: метрики агента за момент времени
 */

export type AgentRole = 'Architect' | 'Coder' | 'Tester' | 'Reviewer';
export type AgentStatus = 'idle' | 'working' | 'error' | 'paused';
export type HealthStatus = 'healthy' | 'warning' | 'error' | 'unknown';

export interface AgentRecord {
  id: string;
  role: AgentRole;
  status: AgentStatus;
  project_name: string;
  project_path: string;
  tmux_session: string | null;
  position_x: number;
  position_y: number;
  created_at: number;
  last_seen: number;
}

export interface MetricsSnapshot {
  id?: number;
  agent_id: string;
  timestamp: number;
  health: HealthStatus | null;
  context_usage: number | null;
  uptime: number | null;
}
