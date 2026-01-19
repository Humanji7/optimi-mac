/**
 * Initial database schema migration
 *
 * Создаёт таблицы:
 * - agents: хранение состояния агентов
 * - metrics_snapshots: история метрик агентов
 */

import Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  // Create agents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'idle',
      project_name TEXT NOT NULL,
      project_path TEXT NOT NULL,
      tmux_session TEXT,
      position_x INTEGER DEFAULT 100,
      position_y INTEGER DEFAULT 100,
      created_at INTEGER NOT NULL,
      last_seen INTEGER NOT NULL
    );
  `);

  // Create metrics_snapshots table
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      health TEXT,
      context_usage INTEGER,
      uptime INTEGER,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_metrics_agent_id
    ON metrics_snapshots(agent_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_metrics_timestamp
    ON metrics_snapshots(timestamp);
  `);

  console.log('[DB] Migrations completed successfully');
}
