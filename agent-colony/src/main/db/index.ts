/**
 * SQLite database instance for Agent Colony
 *
 * Создаёт и настраивает базу данных:
 * - Путь: userData/agent-colony.db
 * - WAL mode: для лучшей concurrency
 * - Migrations: автоматическое создание схемы
 */

import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { runMigrations } from './migrations/001_initial';

let db: Database.Database | null = null;

/**
 * Initialize database connection
 *
 * Создаёт базу данных при первом вызове, включает WAL mode,
 * выполняет миграции.
 *
 * @returns Database instance
 */
export function initDatabase(): Database.Database {
  if (db) return db;

  const dbPath = path.join(app.getPath('userData'), 'agent-colony.db');
  console.log('[DB] Initializing database at:', dbPath);

  db = new Database(dbPath);

  // Enable WAL mode for better concurrency
  // WAL позволяет читателям работать параллельно с писателями
  db.pragma('journal_mode = WAL');

  // Run migrations
  runMigrations(db);

  console.log('[DB] Database initialized successfully');

  return db;
}

/**
 * Get active database instance
 *
 * @throws {Error} If database not initialized
 * @returns Database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 *
 * Должна вызываться при shutdown приложения.
 */
export function closeDatabase(): void {
  if (db) {
    console.log('[DB] Closing database connection');
    db.close();
    db = null;
  }
}
