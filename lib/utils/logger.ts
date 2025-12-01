/**
 * Centralized logger utility
 * Only logs in development mode to avoid exposing info in production
 */

const isDev = process.env.NODE_ENV === "development";

type LogLevel = "log" | "warn" | "error" | "debug" | "info";

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  group: (label: string) => void;
  groupEnd: () => void;
}

const noop = () => {};

const createLogger = (): Logger => {
  if (isDev) {
    return {
      log: (...args) => console.log(...args),
      warn: (...args) => console.warn(...args),
      error: (...args) => console.error(...args),
      debug: (...args) => console.debug(...args),
      info: (...args) => console.info(...args),
      group: (label) => console.group(label),
      groupEnd: () => console.groupEnd(),
    };
  }

  return {
    log: noop,
    warn: noop,
    error: (...args) => console.error(...args), // Keep errors in production
    debug: noop,
    info: noop,
    group: noop,
    groupEnd: noop,
  };
};

export const logger = createLogger();

/**
 * Create a namespaced logger for specific modules
 */
export const createNamespacedLogger = (namespace: string): Logger => {
  const prefix = `[${namespace}]`;

  if (isDev) {
    return {
      log: (...args) => console.log(prefix, ...args),
      warn: (...args) => console.warn(prefix, ...args),
      error: (...args) => console.error(prefix, ...args),
      debug: (...args) => console.debug(prefix, ...args),
      info: (...args) => console.info(prefix, ...args),
      group: (label) => console.group(`${prefix} ${label}`),
      groupEnd: () => console.groupEnd(),
    };
  }

  return {
    log: noop,
    warn: noop,
    error: (...args) => console.error(prefix, ...args),
    debug: noop,
    info: noop,
    group: noop,
    groupEnd: noop,
  };
};
