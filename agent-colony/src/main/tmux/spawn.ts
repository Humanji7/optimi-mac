/**
 * @file tmux/spawn.ts
 * @description Spawn new tmux session for agent
 *
 * Functions:
 * - spawnSession(options): Create detached tmux session
 *
 * Security:
 * - Uses execFile (NOT exec) to prevent shell injection
 * - Validates session name against regex
 * - Validates workDir exists and is absolute
 *
 * Dependencies:
 * - types.ts: SpawnOptions, TmuxSession, execFileAsync, createTmuxError, SESSION_NAME_REGEX
 * - list.ts: sessionExists, listSessions
 * - send.ts: sendKeys
 */

import { existsSync } from 'fs';
import { isAbsolute } from 'path';
import {
  SpawnOptions,
  TmuxSession,
  execFileAsync,
  createTmuxError,
  SESSION_NAME_REGEX,
} from './types';
import { sessionExists, listSessions } from './list';
import { sendKeys } from './send';

/**
 * Spawn new tmux session
 *
 * Creates detached session with specified name and working directory.
 * Optionally executes initial command.
 *
 * @param options - Spawn configuration
 * @returns Created session metadata
 * @throws Error if sessionName invalid or workDir invalid
 * @throws TmuxError with code 'SESSION_EXISTS' if session already exists
 * @throws TmuxError with code 'SPAWN_FAILED' if tmux fails to create session
 *
 * Example:
 *   const session = await spawnSession({
 *     sessionName: 'agent-1',
 *     workDir: '/Users/admin/projects/my-project',
 *     command: 'claude'
 *   });
 */
export async function spawnSession(options: SpawnOptions): Promise<TmuxSession> {
  const { sessionName, workDir, command } = options;

  // Validate session name
  if (!SESSION_NAME_REGEX.test(sessionName)) {
    throw new Error(
      `Invalid session name: "${sessionName}". Must match ${SESSION_NAME_REGEX} (alphanumeric, dash, underscore, 1-50 chars)`
    );
  }

  // Validate workDir is absolute path
  if (!isAbsolute(workDir)) {
    throw new Error(`workDir must be absolute path, got: ${workDir}`);
  }

  // Validate workDir exists
  if (!existsSync(workDir)) {
    throw new Error(`workDir does not exist: ${workDir}`);
  }

  // Check session doesn't already exist
  const exists = await sessionExists(sessionName);
  if (exists) {
    throw createTmuxError(`Session already exists: ${sessionName}`, 'SESSION_EXISTS');
  }

  // Create detached session
  // -d: detached (don't attach)
  // -s: session name
  // -c: working directory
  try {
    await execFileAsync('tmux', ['new-session', '-d', '-s', sessionName, '-c', workDir]);
  } catch (error: any) {
    throw createTmuxError(
      `Failed to spawn session: ${error.message}`,
      'SPAWN_FAILED'
    );
  }

  // Send initial command if provided
  if (command) {
    await sendKeys(sessionName, command);
  }

  // Get session info
  const sessions = await listSessions();
  const session = sessions.find((s) => s.name === sessionName);

  if (!session) {
    // This should never happen, but handle it
    throw createTmuxError(
      `Session created but not found in list: ${sessionName}`,
      'SPAWN_FAILED'
    );
  }

  return session;
}
