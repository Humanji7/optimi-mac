/**
 * @file tmux/types.ts
 * @description Type definitions for tmux session management
 *
 * Exports:
 * - TmuxSession: tmux session metadata
 * - SpawnOptions: options for spawning new session
 * - TmuxError: typed errors for tmux operations
 * - execFileAsync: promisified execFile for secure command execution
 * - SESSION_NAME_REGEX: validation pattern for session names
 */

import { execFile } from 'child_process';
import { promisify } from 'util';

/**
 * Promisified execFile for async/await usage
 * Uses execFile (NOT exec) to prevent shell injection
 */
export const execFileAsync = promisify(execFile);

/**
 * Validation regex for tmux session names
 * - Only alphanumeric, underscore, dash
 * - Length: 1-50 characters
 * - No shell metacharacters allowed
 */
export const SESSION_NAME_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;

/**
 * tmux session metadata
 */
export interface TmuxSession {
  /** Session name (unique identifier) */
  name: string;

  /** Number of windows in session */
  windowCount: number;

  /** Session creation timestamp */
  created: Date;

  /** Whether any client is attached */
  attached: boolean;
}

/**
 * Options for spawning new tmux session
 */
export interface SpawnOptions {
  /** Unique session name (validated against SESSION_NAME_REGEX) */
  sessionName: string;

  /** Working directory (must be absolute path) */
  workDir: string;

  /** Optional initial command to run in session */
  command?: string;
}

/**
 * Typed error for tmux operations
 */
export interface TmuxError extends Error {
  /** Error code for programmatic handling */
  code: 'SESSION_EXISTS' | 'SESSION_NOT_FOUND' | 'TMUX_NOT_INSTALLED' | 'SPAWN_FAILED';
}

/**
 * Create TmuxError with code
 */
export function createTmuxError(message: string, code: TmuxError['code']): TmuxError {
  const error = new Error(message) as TmuxError;
  error.code = code;
  return error;
}
