/**
 * Agent model - CRUD operations for agents table
 *
 * Функции для работы с агентами в базе данных.
 * Все операции используют retry logic для обработки SQLITE_BUSY.
 */

import { getDatabase } from '../index';
import { AgentRecord, AgentStatus } from '../types';
import { withRetry } from '../retry';

/**
 * Create new agent record
 *
 * @param agent Agent data without timestamps
 * @returns Created agent with timestamps
 */
export function createAgent(
  agent: Omit<AgentRecord, 'created_at' | 'last_seen'>
): AgentRecord {
  return withRetry(() => {
    const db = getDatabase();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO agents (
        id, role, status, project_name, project_path,
        tmux_session, position_x, position_y, created_at, last_seen
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      agent.id,
      agent.role,
      agent.status,
      agent.project_name,
      agent.project_path,
      agent.tmux_session,
      agent.position_x,
      agent.position_y,
      now,
      now
    );

    console.log(`[DB] Created agent: ${agent.id}`);

    return {
      ...agent,
      created_at: now,
      last_seen: now,
    };
  });
}

/**
 * Get agent by ID
 *
 * @param id Agent ID
 * @returns Agent record or null if not found
 */
export function getAgent(id: string): AgentRecord | null {
  return withRetry(() => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM agents WHERE id = ?');
    const row = stmt.get(id) as AgentRecord | undefined;
    return row || null;
  });
}

/**
 * Get all agents
 *
 * @returns Array of all agent records
 */
export function getAllAgents(): AgentRecord[] {
  return withRetry(() => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM agents ORDER BY created_at DESC');
    return stmt.all() as AgentRecord[];
  });
}

/**
 * Update agent fields
 *
 * @param id Agent ID
 * @param updates Partial agent data to update
 * @returns Updated agent or null if not found
 */
export function updateAgent(
  id: string,
  updates: Partial<AgentRecord>
): AgentRecord | null {
  return withRetry(() => {
    const db = getDatabase();

    // Build dynamic UPDATE query
    const fields = Object.keys(updates)
      .filter(key => key !== 'id') // Can't update primary key
      .map(key => `${key} = ?`);

    if (fields.length === 0) {
      return getAgent(id);
    }

    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id')
      .map(([, value]) => value);

    const stmt = db.prepare(`
      UPDATE agents
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values, id);

    console.log(`[DB] Updated agent: ${id}`);

    return getAgent(id);
  });
}

/**
 * Update agent status
 *
 * @param id Agent ID
 * @param status New status
 */
export function updateAgentStatus(id: string, status: AgentStatus): void {
  withRetry(() => {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE agents SET status = ? WHERE id = ?');
    stmt.run(status, id);
    console.log(`[DB] Updated agent status: ${id} -> ${status}`);
  });
}

/**
 * Update agent last_seen timestamp
 *
 * @param id Agent ID
 */
export function updateLastSeen(id: string): void {
  withRetry(() => {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE agents SET last_seen = ? WHERE id = ?');
    stmt.run(Date.now(), id);
  });
}

/**
 * Delete agent
 *
 * @param id Agent ID
 * @returns true if deleted, false if not found
 */
export function deleteAgent(id: string): boolean {
  return withRetry(() => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM agents WHERE id = ?');
    const result = stmt.run(id);
    const deleted = result.changes > 0;

    if (deleted) {
      console.log(`[DB] Deleted agent: ${id}`);
    }

    return deleted;
  });
}

/**
 * Get agents by status
 *
 * @param status Agent status to filter by
 * @returns Array of agents with given status
 */
export function getAgentsByStatus(status: AgentStatus): AgentRecord[] {
  return withRetry(() => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM agents WHERE status = ?');
    return stmt.all(status) as AgentRecord[];
  });
}
