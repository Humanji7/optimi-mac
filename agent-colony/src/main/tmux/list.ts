/**
 * @file tmux/list.ts
 * @description List active tmux sessions and check session existence
 *
 * Functions:
 * - listSessions(): Get all active tmux sessions
 * - sessionExists(name): Check if specific session exists
 *
 * Dependencies:
 * - types.ts: TmuxSession, execFileAsync, createTmuxError
 */

import { TmuxSession, execFileAsync, createTmuxError } from './types';

/**
 * List all active tmux sessions
 *
 * @returns Array of TmuxSession objects (empty if no sessions)
 * @throws TmuxError with code 'TMUX_NOT_INSTALLED' if tmux not found
 *
 * Format: tmux list-sessions -F "#{session_name}:#{session_windows}:#{session_created}:#{session_attached}"
 * Example output: "agent-1:1:1737331200:0"
 */
export async function listSessions(): Promise<TmuxSession[]> {
  try {
    const { stdout } = await execFileAsync('tmux', [
      'list-sessions',
      '-F',
      '#{session_name}:#{session_windows}:#{session_created}:#{session_attached}',
    ]);

    // Empty output means no sessions
    if (!stdout.trim()) {
      return [];
    }

    // Parse each line into TmuxSession
    return stdout
      .trim()
      .split('\n')
      .map((line) => {
        const [name, windowCount, created, attached] = line.split(':');
        return {
          name,
          windowCount: parseInt(windowCount, 10),
          created: new Date(parseInt(created, 10) * 1000), // Unix timestamp to Date
          attached: attached === '1',
        };
      });
  } catch (error: any) {
    // No sessions exist (tmux returns error if no server running)
    // Different error messages on different systems:
    // - "no server running" (Linux)
    // - "No such file or directory" (macOS - socket doesn't exist yet)
    // - "error connecting to" (macOS alternative)
    const msg = error.message || error.stderr || '';
    if (
      msg.includes('no server running') ||
      msg.includes('No such file or directory') ||
      msg.includes('error connecting to')
    ) {
      return [];
    }

    // tmux not installed
    if (error.code === 'ENOENT') {
      throw createTmuxError('tmux is not installed or not in PATH', 'TMUX_NOT_INSTALLED');
    }

    // Unknown error - re-throw
    throw error;
  }
}

/**
 * Check if tmux session exists by name
 *
 * @param sessionName - Name of session to check
 * @returns true if session exists, false otherwise
 */
export async function sessionExists(sessionName: string): Promise<boolean> {
  const sessions = await listSessions();
  return sessions.some((session) => session.name === sessionName);
}
