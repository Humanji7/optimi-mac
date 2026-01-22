/**
 * Terminal Capture
 * Purpose: Захват вывода из tmux pane
 */

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const SESSION_NAME_REGEX = /^agent-[a-f0-9]{8}$/;

export async function capturePane(sessionName: string, lines: number = 10): Promise<string[]> {
  if (!SESSION_NAME_REGEX.test(sessionName)) {
    throw new Error(`Invalid session name: ${sessionName}`);
  }

  try {
    const { stdout } = await execFileAsync('tmux', [
      'capture-pane',
      '-t', sessionName,
      '-p',
      '-S', `-${lines}`,
      '-E', '-1'
    ]);

    // Разбиваем на строки, убираем пустые в конце, берём последние N
    const allLines = stdout.split('\n').map(line => line.trimEnd());
    // Убираем trailing empty lines
    while (allLines.length > 0 && allLines[allLines.length - 1] === '') {
      allLines.pop();
    }
    // Возвращаем последние N строк
    return allLines.slice(-lines);
  } catch (error: any) {
    // Session может не существовать — возвращаем пустой массив
    console.error(`[capturePane] Failed for ${sessionName}:`, error.message);
    return [];
  }
}
