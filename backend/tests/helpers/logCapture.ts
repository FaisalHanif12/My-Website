import type { LogLevel } from '../../src/config/env.js';
import { createLogger } from '../../src/lib/logger.js';
import type { Logger } from '../../src/lib/logger.js';

export interface CapturedLine {
  level: number;
  msg?: string;
  [key: string]: unknown;
}

export interface CapturingLogger {
  logger: Logger;
  /** Every line written so far, parsed from JSON. */
  lines: () => CapturedLine[];
  /** Everything written so far, as raw text. */
  text: () => string;
}

/**
 * A real logger (same redaction as production) that writes into memory, so tests can
 * check what gets logged and what never does.
 */
export function createCapturingLogger(level: LogLevel = 'trace'): CapturingLogger {
  const chunks: string[] = [];
  const destination = {
    write(chunk: string): void {
      chunks.push(chunk);
    },
  };
  const logger = createLogger({ NODE_ENV: 'test', LOG_LEVEL: level }, destination);
  const text = () => chunks.join('');
  return {
    logger,
    text,
    lines: () =>
      text()
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line) as CapturedLine),
  };
}
