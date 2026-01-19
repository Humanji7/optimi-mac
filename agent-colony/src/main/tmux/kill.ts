/**
 * @file tmux/kill.ts
 * @description Kill tmux session gracefully
 *
 * Functions:
 * - killSession(sessionName): Terminate session
 *
 * Dependencies:
 * - types.ts: execFileAsync, createTmuxError, SESSION_NAME_REGEX
 * - list.ts: sessionExists
 */

import { execFileAsync, createTmuxError, SESSION_NAME_REGEX } from './types';
import { sessionExists } from './list';

/**
 * Kill tmux session
 *
 * Terminates session and all processes running in it.
 * Gracefully handles case where session doesn't exist.
 *
 * @param sessionName - Name of session to kill
 * @throws Error if sessionName is invalid
 * @throws TmuxError with code 'SESSION_NOT_FOUND' if session doesn't exist
 *
 * Example:
 *   await killSession('agent-1');
 */
export async function killSession(sessionName: string): Promise<void> {
  // Validate session name
  if (!SESSION_NAME_REGEX.test(sessionName)) {
    throw new Error(`Invalid session name: ${sessionName}. Must match ${SESSION_NAME_REGEX}`);
  }

  // Check session exists
  const exists = await sessionExists(sessionName);
  if (!exists) {
    throw createTmuxError(`Session not found: ${sessionName}`, 'SESSION_NOT_FOUND');
  }

  // Kill session
  // -t: target session
  try {
    await execFileAsync('tmux', ['kill-session', '-t', sessionName]);
  } catch (error: any) {
    // Session was killed between check and kill command
    // This is OK - treat as success
    if (error.message?.includes('session not found')) {
      return;
    }

    // Unknown error - re-throw
    throw error;
  }
}
