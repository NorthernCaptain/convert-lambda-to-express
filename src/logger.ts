/**
 * Minimal logger interface compatible with winston.Logger and console
 */
export interface Logger {
  info(message: unknown): void;
  error(message: unknown): void;
}
