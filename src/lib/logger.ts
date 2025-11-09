/**
 * Logger utility that only logs in development mode
 * In production, logs are silenced to improve performance and security
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  error: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.error(...args);
    }
  },

  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};
