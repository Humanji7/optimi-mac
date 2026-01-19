/**
 * Agent Types - Full Agent Model
 *
 * Defines complete agent data structure used across the system.
 * Based on Phase 1 design document.
 */

export type AgentRole = 'Architect' | 'Coder' | 'Tester' | 'Reviewer';
export type AgentStatus = 'idle' | 'working' | 'error' | 'paused';
export type HealthStatus = 'healthy' | 'warning' | 'error' | 'unknown';

export interface AgentProject {
  name: string;
  path: string;
}

export interface AgentProcess {
  tmuxSession: string;
  pid: number | null;
}

export interface AgentMetrics {
  health: HealthStatus;
  contextUsage: number | null;  // 0-100% or null
  uptime: number;               // seconds
  lastActivity: number;         // Unix timestamp
}

export interface AgentPosition {
  x: number;
  y: number;
}

export interface HookStatus {
  active: boolean;
  currentMolecule: string | null;
  totalMolecules: number | null;
  hookPath: string | null;
}

export interface Agent {
  id: string;
  role: AgentRole;
  status: AgentStatus;
  project: AgentProject;
  process: AgentProcess;
  metrics: AgentMetrics;
  position: AgentPosition;
  hookStatus: HookStatus;
  createdAt: number;
}

export interface SpawnAgentOptions {
  role: AgentRole;
  projectName: string;
  projectPath: string;
  command?: string;  // e.g., "claude" or "codex"
}
