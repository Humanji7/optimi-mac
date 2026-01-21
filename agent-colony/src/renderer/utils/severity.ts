/**
 * Error Severity Classification
 *
 * Классифицирует ошибки агентов на три уровня:
 * - blocker: критическая проблема, агент не может работать
 * - warning: временная проблема, требует мониторинга
 * - info: неизвестное состояние, требует внимания
 */

export type ErrorSeverity = 'blocker' | 'warning' | 'info';

export const SEVERITY_COLORS: Record<ErrorSeverity, string> = {
  blocker: '#ef4444', // red
  warning: '#eab308', // yellow
  info: '#3b82f6',    // blue
};

export const SEVERITY_ICONS: Record<ErrorSeverity, string> = {
  blocker: '●',  // filled circle
  warning: '◐',  // half circle
  info: '○',     // empty circle
};

/**
 * Определяет severity на основе health и status
 */
export function getSeverity(
  health: string | undefined,
  status: string | undefined
): ErrorSeverity | null {
  // Blocker: критическое состояние
  if (health === 'error' || status === 'error') {
    return 'blocker';
  }

  // Warning: временная проблема
  if (health === 'warning') {
    return 'warning';
  }

  // Info: неизвестное состояние
  if (health === 'unknown') {
    return 'info';
  }

  // No issues
  return null;
}

/**
 * Классифицирует сообщение об ошибке
 */
export function classifyErrorMessage(message: string): ErrorSeverity {
  const msg = message.toLowerCase();

  // Blocker patterns
  if (
    msg.includes('session not found') ||
    msg.includes('enoent') ||
    msg.includes('failed to spawn') ||
    msg.includes('connection refused')
  ) {
    return 'blocker';
  }

  // Warning patterns
  if (
    msg.includes('timeout') ||
    msg.includes('busy') ||
    msg.includes('retry') ||
    msg.includes('slow')
  ) {
    return 'warning';
  }

  // Default to info
  return 'info';
}
