/**
 * Pluggable logging system for the provisioning engine.
 * 
 * @remarks
 * Provides a flexible logging infrastructure with:
 * - Multiple log levels (debug, info, warn, error, silent)
 * - Pluggable sinks for custom log destinations
 * - Contextual logging with scopes
 * - Structured log events with metadata
 * 
 * @packageDocumentation
 */

import { nowIso, normalizeError } from "./utils";

/**
 * Available log levels for filtering log output.
 * 
 * @remarks
 * Levels from most verbose to least:
 * - `debug`: Detailed diagnostic information
 * - `info`: General informational messages
 * - `warn`: Warning messages for potential issues
 * - `error`: Error messages for failures
 * - `silent`: Suppress all log output
 * 
 * @public
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

/**
 * Internal ranking of log levels for comparison.
 * 
 * @internal
 */
const LOG_RANK: Record<Exclude<LogLevel, "silent">, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
};

/**
 * Structured log event with metadata.
 * 
 * @remarks
 * Contains all information about a single log entry including:
 * - Level and timestamp
 * - Message and optional structured data
 * - Contextual scope information
 * - Error details if applicable
 * 
 * @public
 */
export type LogEvent = {
    /** The severity level of this log event */
    level: Exclude<LogLevel, "silent">;

    /** ISO 8601 timestamp when the event occurred */
    at: string;

    /** The log message */
    message: string;

    /** Optional contextual scope (e.g., action path, verb, requestId) */
    scope?: Record<string, string | undefined>;

    /** Optional structured data payload */
    data?: unknown;

    /** Optional error details with message and stack trace */
    error?: { message: string; stack?: string };
};

/**
 * Interface for log output destinations.
 * 
 * @remarks
 * Implement this interface to create custom log sinks (e.g., file, database, external service).
 * The sink receives fully-formed log events and is responsible for formatting and writing them.
 * 
 * @example
 * ```typescript
 * const fileSink: LogSink = {
 *   write: (event) => {
 *     fs.appendFileSync('app.log', JSON.stringify(event) + '\n');
 *   }
 * };
 * ```
 * 
 * @public
 */
export interface LogSink {
    /**
     * Writes a log event to the destination.
     * 
     * @param event - The log event to write
     */
    write(event: LogEvent): void;
}

/**
 * Logger interface for recording structured log messages.
 * 
 * @remarks
 * Provides methods for logging at different levels and creating scoped child loggers.
 * All loggers respect the configured log level and only emit events at or above that level.
 * 
 * @public
 */
export interface Logger {
    /** The current log level for this logger */
    level: LogLevel;

    /**
     * Checks if a given log level is enabled.
     * 
     * @param level - The log level to check
     * @returns True if messages at this level will be emitted
     */
    isEnabled(level: Exclude<LogLevel, "silent">): boolean;

    /**
     * Logs a debug message.
     * 
     * @param message - The log message
     * @param data - Optional structured data payload
     */
    debug(message: string, data?: unknown): void;

    /**
     * Logs an info message.
     * 
     * @param message - The log message
     * @param data - Optional structured data payload
     */
    info(message: string, data?: unknown): void;

    /**
     * Logs a warning message.
     * 
     * @param message - The log message
     * @param data - Optional structured data payload
     */
    warn(message: string, data?: unknown): void;

    /**
     * Logs an error message.
     * 
     * @param message - The log message
     * @param err - Optional error object (will be normalized)
     * @param data - Optional structured data payload
     */
    error(message: string, err?: unknown, data?: unknown): void;

    /**
     * Creates a child logger with additional scope context.
     * 
     * @param scope - Additional scope properties to include in all log events
     * @returns A new logger instance with the extended scope
     * 
     * @example
     * ```typescript
    * const childLogger = logger.withScope({ actionPath: "1/1", verb: "createSPList" });
     * childLogger.info("Starting action"); // Includes scope in log event
     * ```
     */
    withScope(scope: Record<string, string | undefined>): Logger;
}

/**
 * Determines if a log event should be emitted based on current and target levels.
 * 
 * @param current - The logger's configured level
 * @param level - The level of the event being logged
 * @returns True if the event should be emitted
 * 
 * @internal
 */
const shouldLog = (current: LogLevel, level: Exclude<LogLevel, "silent">): boolean => {
    if (current === "silent") return false;
    return LOG_RANK[level] >= LOG_RANK[current];
};

/**
 * Built-in console log sink for development and simple scenarios.
 * 
 * @remarks
 * Formats log events as human-readable strings and writes them to the appropriate
 * console method (error, warn, info, debug) based on the event level.
 * 
 * Format: `[timestamp] LEVEL {scope} message`
 * 
 * @example
 * ```typescript
 * const logger = createLogger({ level: "info", sink: consoleSink });
 * ```
 * 
 * @public
 */
export const consoleSink: LogSink = {
    write: (e) => {
        const scope = e.scope ? JSON.stringify(e.scope) : "";
        const line = `[${e.at}] ${e.level.toUpperCase()} ${scope} ${e.message}`.trim();
        if (e.level === "error") console.error(line, e.error ?? "", e.data ?? "");
        else if (e.level === "warn") console.warn(line, e.data ?? "");
        else if (e.level === "info") console.info(line, e.data ?? "");
        else console.debug(line, e.data ?? "");
    },
};

/**
 * Creates a new logger instance.
 * 
 * @param opts - Logger configuration options
 * @param opts.level - The minimum log level to emit
 * @param opts.sink - The destination for log events
 * @param opts.scope - Optional base scope to include in all log events
 * @returns A new Logger instance
 * 
 * @example
 * ```typescript
 * const logger = createLogger({
 *   level: "info",
 *   sink: consoleSink,
 *   scope: { requestId: "req-123" }
 * });
 * 
 * logger.info("Operation started"); // Includes requestId in scope
 * logger.debug("Debug info"); // Not emitted (below info level)
 * ```
 * 
 * @public
 */
export const createLogger = (opts: {
    level: LogLevel;
    sink: LogSink;
    scope?: LogEvent["scope"]
}): Logger => {
    const baseScope = opts.scope ?? {};

    const write = (event: Omit<LogEvent, "at" | "scope"> & { scope?: LogEvent["scope"] }): void => {
        if (!shouldLog(opts.level, event.level)) return;
        opts.sink.write({
            ...event,
            at: nowIso(),
            scope: { ...baseScope, ...(event.scope ?? {}) }
        });
    };

    return {
        level: opts.level,
        isEnabled: (lvl) => shouldLog(opts.level, lvl),
        debug: (message, data) => write({ level: "debug", message, data }),
        info: (message, data) => write({ level: "info", message, data }),
        warn: (message, data) => write({ level: "warn", message, data }),
        error: (message, err, data) => write({
            level: "error",
            message,
            ...(err !== undefined && err !== null ? { error: normalizeError(err) } : {}),
            data,
        }),
        withScope: (scope) => createLogger({
            level: opts.level,
            sink: opts.sink,
            scope: { ...baseScope, ...scope }
        }),
    };
};
