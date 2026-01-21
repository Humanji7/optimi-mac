/**
 * @file tmux/index.ts
 * @description Public API for tmux session management
 *
 * This module provides secure, type-safe tmux session operations
 * for managing AI agent processes in isolated tmux sessions.
 *
 * Core functions:
 * - spawnSession: Create new detached session
 * - killSession: Terminate session
 * - listSessions: Get all active sessions
 * - sendKeys: Send commands to session
 * - sessionExists: Check if session exists
 *
 * Security:
 * - All commands use execFile (NOT exec) to prevent shell injection
 * - Session names validated against strict regex
 * - Working directories validated as absolute paths
 *
 * Example usage:
 *   import { spawnSession, killSession, listSessions } from './tmux';
 *
 *   // Spawn agent session
 *   const session = await spawnSession({
 *     sessionName: 'agent-architect-1',
 *     workDir: '/Users/admin/projects/my-project',
 *     command: 'claude'
 *   });
 *
 *   // List all sessions
 *   const sessions = await listSessions();
 *
 *   // Kill session
 *   await killSession('agent-architect-1');
 */

// Re-export types
export type { TmuxSession, SpawnOptions, TmuxError } from './types';
export { SESSION_NAME_REGEX, createTmuxError } from './types';

// Re-export functions
export { spawnSession, spawnSession as createSession } from './spawn';
export { killSession } from './kill';
export { listSessions, sessionExists } from './list';
export { sendKeys, sendEscape } from './send';
