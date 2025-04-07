import { backendClient } from '../api/clients/backend';

// Define log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Interface for log entries
interface LogEntry {
  level: LogLevel;
  message: string;
  details?: any;
  timestamp: string;
  source: 'frontend';
  userId?: string | null;
  url: string;
  userAgent: string;
}

// Logger configuration options
interface LoggerConfig {
  sendToBackend: boolean;
  logLevels: LogLevel[];
  maxQueueSize: number;
  flushInterval: number;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  sendToBackend: import.meta.env.PROD, // Only send to backend in production by default
  logLevels: ['error', 'warn'], // Only send error and warning logs by default
  maxQueueSize: 10,
  flushInterval: 10000, // 10 seconds
};

// Current configuration
let config: LoggerConfig = { ...defaultConfig };

// Queue to store logs before sending them in batches
let logQueue: LogEntry[] = [];
let queueTimer: NodeJS.Timeout | null = null;

// Original console methods
const originalConsole = {
  log: console.log,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

// Helper function to create a log entry
const createLogEntry = (level: LogLevel, args: any[]): LogEntry => {
  // Convert all arguments to strings, handling objects appropriately
  const message = args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return `[Object that cannot be stringified]`;
      }
    }
    return String(arg);
  }).join(' ');

  // Get additional details if the first argument is an object
  let details = undefined;
  if (args.length > 0 && typeof args[0] === 'object' && args[0] !== null) {
    try {
      details = args[0];
    } catch (e) {
      // Ignore if can't get details
    }
  }

  return {
    level,
    message,
    details,
    timestamp: new Date().toISOString(),
    source: 'frontend',
    userId: localStorage.getItem('userId'),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };
};

// Function to send logs to backend
const sendLogsToBackend = async (logs: LogEntry[]): Promise<void> => {
  if (logs.length === 0) return;
  
  // Filter logs based on configured log levels
  const filteredLogs = logs.filter(log => config.logLevels.includes(log.level));
  
  if (filteredLogs.length === 0) return;
  
  // Don't send logs if sending to backend is disabled
  if (!config.sendToBackend) return;

  try {
    await backendClient({
      endpoint: '/api/v1/logs',
      method: 'POST',
      body: { logs: filteredLogs },
    });
    // Don't log the response to avoid infinite loop
  } catch (error) {
    // Use original console to avoid infinite loop
    originalConsole.error('Failed to send logs to backend:', error);
  }
};

// Function to add log to queue and flush if needed
const queueLog = (entry: LogEntry): void => {
  logQueue.push(entry);

  // Flush immediately if queue is full
  if (logQueue.length >= config.maxQueueSize) {
    flushLogs();
  }

  // Set up timer to flush logs if not already set
  if (!queueTimer) {
    queueTimer = setTimeout(flushLogs, config.flushInterval);
  }
};

// Function to flush logs to backend
const flushLogs = async (): void => {
  if (queueTimer) {
    clearTimeout(queueTimer);
    queueTimer = null;
  }

  if (logQueue.length === 0) return;

  const logsToSend = [...logQueue];
  logQueue = [];

  await sendLogsToBackend(logsToSend);
};

// Override console methods
const setupConsoleOverrides = () => {
  console.log = (...args: any[]) => {
    originalConsole.log(...args);
    queueLog(createLogEntry('debug', args));
  };

  console.debug = (...args: any[]) => {
    originalConsole.debug(...args);
    queueLog(createLogEntry('debug', args));
  };

  console.info = (...args: any[]) => {
    originalConsole.info(...args);
    queueLog(createLogEntry('info', args));
  };

  console.warn = (...args: any[]) => {
    originalConsole.warn(...args);
    queueLog(createLogEntry('warn', args));
  };

  console.error = (...args: any[]) => {
    originalConsole.error(...args);
    queueLog(createLogEntry('error', args));
  };
};

// Method to restore original console behavior
const restoreConsole = () => {
  console.log = originalConsole.log;
  console.debug = originalConsole.debug;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  
  // Flush any remaining logs
  if (logQueue.length > 0) {
    flushLogs();
  }
};

// Configure the logger
const configure = (newConfig: Partial<LoggerConfig>) => {
  config = { ...config, ...newConfig };
};

// Logger object with public methods
export const logger = {
  setup: setupConsoleOverrides,
  restore: restoreConsole,
  flush: flushLogs,
  configure,
  // Expose current configuration for debugging
  getConfig: () => ({ ...config }),
};

// Handle page unload to send any remaining logs
window.addEventListener('beforeunload', () => {
  flushLogs();
});

export default logger; 