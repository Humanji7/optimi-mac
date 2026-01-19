/**
 * Agent Events - EventEmitter for UI Updates
 *
 * Central event bus for agent lifecycle events.
 * Used by AgentManager to notify renderer process about changes.
 */

import { EventEmitter } from 'events';

export const agentEvents = new EventEmitter();

// Event types:
// 'agent:spawned' - payload: Agent
// 'agent:updated' - payload: { id: string, changes: Partial<Agent> }
// 'agent:killed' - payload: { id: string }
// 'agent:error' - payload: { id: string, error: string }
// 'health:checked' - payload: { agents: Agent[] }

export type AgentEventType =
  | 'agent:spawned'
  | 'agent:updated'
  | 'agent:killed'
  | 'agent:error'
  | 'health:checked';
