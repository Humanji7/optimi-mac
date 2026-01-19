/**
 * Agent Registry - In-memory Agent Map
 *
 * Fast in-memory storage for active agents.
 * Backed by SQLite for persistence.
 */

import { Agent } from './types';

const agents = new Map<string, Agent>();

export function getAgent(id: string): Agent | undefined {
  return agents.get(id);
}

export function getAllAgents(): Agent[] {
  return Array.from(agents.values());
}

export function setAgent(agent: Agent): void {
  agents.set(agent.id, agent);
}

export function removeAgent(id: string): boolean {
  return agents.delete(id);
}

export function updateAgent(id: string, updates: Partial<Agent>): Agent | null {
  const agent = agents.get(id);
  if (!agent) {
    return null;
  }

  const updatedAgent: Agent = {
    ...agent,
    ...updates,
    // Preserve nested objects if not explicitly updated
    project: updates.project || agent.project,
    process: updates.process || agent.process,
    metrics: updates.metrics || agent.metrics,
    position: updates.position || agent.position,
    hookStatus: updates.hookStatus || agent.hookStatus,
  };

  agents.set(id, updatedAgent);
  return updatedAgent;
}

export function clear(): void {
  agents.clear();
}
