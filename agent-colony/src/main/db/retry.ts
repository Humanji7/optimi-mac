/**
 * Retry logic for SQLite BUSY/LOCKED errors
 *
 * Реализует exponential backoff для повторных попыток
 * при блокировках базы данных.
 */

export interface RetryOptions {
  maxRetries?: number;  // default: 3
  baseDelay?: number;   // default: 100ms
  maxDelay?: number;    // default: 2000ms
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 100,
  maxDelay: 2000,
};

// SQLite error codes that are retriable
const RETRIABLE_CODES = ['SQLITE_BUSY', 'SQLITE_LOCKED'];

export function withRetry<T>(
  operation: () => T,
  options?: RetryOptions
): T {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retriable
      const isRetriable = RETRIABLE_CODES.some(code =>
        lastError!.message.includes(code)
      );

      if (!isRetriable) {
        throw lastError;
      }

      // Don't wait after last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Calculate exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt),
        opts.maxDelay
      );

      // Synchronous sleep using busy wait (acceptable for short delays)
      const start = Date.now();
      while (Date.now() - start < delay) {
        // Busy wait
      }

      console.log(
        `[DB Retry] Attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms`
      );
    }
  }

  throw lastError || new Error('Retry failed with no error');
}
