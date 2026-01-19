/**
 * Metrics model - CRUD operations for metrics_snapshots table
 *
 * Функции для сохранения и получения метрик агентов.
 * Метрики сохраняются как snapshots с timestamp.
 */

import { getDatabase } from '../index';
import { MetricsSnapshot } from '../types';
import { withRetry } from '../retry';

/**
 * Save metrics snapshot
 *
 * @param metrics Metrics data without ID
 * @returns ID of created snapshot
 */
export function saveMetrics(metrics: Omit<MetricsSnapshot, 'id'>): number {
  return withRetry(() => {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO metrics_snapshots (
        agent_id, timestamp, health, context_usage, uptime
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      metrics.agent_id,
      metrics.timestamp,
      metrics.health,
      metrics.context_usage,
      metrics.uptime
    );

    const id = Number(result.lastInsertRowid);

    console.log(`[DB] Saved metrics for agent: ${metrics.agent_id}`);

    return id;
  });
}

/**
 * Get latest metrics snapshot for agent
 *
 * @param agentId Agent ID
 * @returns Latest metrics or null if none exist
 */
export function getLatestMetrics(agentId: string): MetricsSnapshot | null {
  return withRetry(() => {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM metrics_snapshots
      WHERE agent_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `);

    const row = stmt.get(agentId) as MetricsSnapshot | undefined;
    return row || null;
  });
}

/**
 * Get metrics history for agent
 *
 * @param agentId Agent ID
 * @param limit Maximum number of snapshots to return (default: 100)
 * @returns Array of metrics snapshots ordered by timestamp DESC
 */
export function getMetricsHistory(
  agentId: string,
  limit: number = 100
): MetricsSnapshot[] {
  return withRetry(() => {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT * FROM metrics_snapshots
      WHERE agent_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    return stmt.all(agentId, limit) as MetricsSnapshot[];
  });
}

/**
 * Clean up old metrics snapshots
 *
 * Удаляет snapshots старше заданного количества дней.
 * Используется для очистки старых данных.
 *
 * @param olderThanDays Delete snapshots older than this many days
 * @returns Number of deleted rows
 */
export function cleanupOldMetrics(olderThanDays: number): number {
  return withRetry(() => {
    const db = getDatabase();

    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    const stmt = db.prepare(`
      DELETE FROM metrics_snapshots
      WHERE timestamp < ?
    `);

    const result = stmt.run(cutoffTime);
    const deleted = result.changes;

    console.log(`[DB] Cleaned up ${deleted} old metrics snapshots`);

    return deleted;
  });
}
