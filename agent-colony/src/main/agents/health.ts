/**
 * Agent Health Check Logic
 *
 * Determines agent health status based on:
 * - tmux session existence
 * - last activity timestamp
 * - process responsiveness
 */

import { Agent, HealthStatus } from './types';
import * as tmux from '../tmux';

export async function checkHealth(agent: Agent): Promise<HealthStatus> {
  // Check if tmux session exists
  const sessionExists = await tmux.sessionExists(agent.process.tmuxSession);

  // Determine health based on session and activity
  return determineHealth(agent.metrics.lastActivity, sessionExists);
}

export function determineHealth(
  lastActivity: number,
  sessionExists: boolean
): HealthStatus {
  if (!sessionExists) {
    return 'error';
  }

  const now = Date.now();
  const idleTime = (now - lastActivity) / 1000; // seconds

  if (idleTime > 900) {
    return 'error'; // >15 min
  }

  if (idleTime > 300) {
    return 'warning'; // >5 min
  }

  return 'healthy';
}
