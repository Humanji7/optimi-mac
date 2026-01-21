/**
 * @file tmux/send.ts
 * @description Send keys (commands) to running tmux session
 *
 * Functions:
 * - sendKeys(sessionName, keys): Send command to session
 *
 * Dependencies:
 * - types.ts: execFileAsync, createTmuxError, SESSION_NAME_REGEX
 * - list.ts: sessionExists
 */

import { execFileAsync, createTmuxError, SESSION_NAME_REGEX } from './types';
import { sessionExists } from './list';

/**
 * Send keys to tmux session
 *
 * Automatically appends Enter key to execute command
 *
 * @param sessionName - Target session name
 * @param keys - Keys/command to send
 * @throws TmuxError with code 'SESSION_NOT_FOUND' if session doesn't exist
 * @throws Error if sessionName is invalid
 *
 * Example:
 *   await sendKeys('agent-1', 'echo "Hello"');
 *   // Executes: tmux send-keys -t agent-1 'echo "Hello"' Enter
 */
export async function sendKeys(sessionName: string, keys: string): Promise<void> {
  // Validate session name
  if (!SESSION_NAME_REGEX.test(sessionName)) {
    throw new Error(`Invalid session name: ${sessionName}. Must match ${SESSION_NAME_REGEX}`);
  }

  // Check session exists
  const exists = await sessionExists(sessionName);
  if (!exists) {
    throw createTmuxError(`Session not found: ${sessionName}`, 'SESSION_NOT_FOUND');
  }

  // Send keys with Enter
  // Note: 'Enter' is a tmux key name, not literal string
  await execFileAsync('tmux', ['send-keys', '-t', sessionName, keys, 'Enter']);
}

/**
 * Send Escape key to tmux session (for interrupting Claude)
 *
 * @param sessionName - Target session name
 * @throws TmuxError with code 'SESSION_NOT_FOUND' if session doesn't exist
 */
export async function sendEscape(sessionName: string): Promise<void> {
  if (!SESSION_NAME_REGEX.test(sessionName)) {
    throw new Error(`Invalid session name: ${sessionName}. Must match ${SESSION_NAME_REGEX}`);
  }

  const exists = await sessionExists(sessionName);
  if (!exists) {
    throw createTmuxError(`Session not found: ${sessionName}`, 'SESSION_NOT_FOUND');
  }

  // Send Escape key without Enter
  await execFileAsync('tmux', ['send-keys', '-t', sessionName, 'Escape']);
}
