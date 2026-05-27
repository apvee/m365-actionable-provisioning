/**
 * Internal utility functions for the provisioning engine.
 * 
 * @remarks
 * These utilities are for internal use only and should not be consumed
 * directly by external code. They provide core functionality for:
 * - Date/time handling
 * - Deep object merging
 * - Error normalization
 * 
 * @internal
 * @packageDocumentation
 */

/**
 * Returns the current date-time in ISO 8601 format.
 * 
 * @returns ISO 8601 formatted timestamp string
 * 
 * @internal
 */
export const nowIso = (): string => new Date().toISOString();

/**
 * Type guard to check if a value is a plain object (not array, not null).
 * 
 * @param v - The value to check
 * @returns True if the value is a plain object
 * 
 * @internal
 */
export const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

/**
 * Performs a deep merge of two objects with array replacement strategy.
 * 
 * @template T - The type of the base object
 * @param base - The base object to merge into
 * @param delta - The changes to apply over the base
 * @returns A new object of type T with delta merged into base
 * 
 * @remarks
 * Merge strategy:
 * - Arrays in delta completely replace arrays in base (no element-wise merge)
 * - Nested plain objects are merged recursively
 * - Primitive values in delta replace values in base
 * - If either argument is not a plain object, delta takes precedence
 * 
 * @example
 * ```typescript
 * const base = { a: 1, b: { c: 2, d: 3 } };
 * const delta = { b: { d: 4, e: 5 }, f: 6 };
 * const result = deepMerge(base, delta);
 * // result: { a: 1, b: { c: 2, d: 4, e: 5 }, f: 6 }
 * ```
 * 
 * @internal
 */
export const deepMerge = <T>(base: T, delta: unknown): T => {
    // Minimal deep merge; arrays replaced; non-objects replaced.
    if (!isPlainObject(base) || !isPlainObject(delta)) return (delta ?? base) as T;

    const out: Record<string, unknown> = { ...base as Record<string, unknown> };

    for (const [k, v] of Object.entries(delta)) {
        const prev = out[k];
        if (isPlainObject(prev) && isPlainObject(v)) out[k] = deepMerge(prev, v);
        else out[k] = v;
    }
    return out as T;
};

/**
 * Normalizes any error value into a consistent error object shape.
 * 
 * @param err - The error to normalize (can be Error, string, or any other type)
 * @returns Normalized error object with message and optional stack trace
 * 
 * @remarks
 * This function ensures consistent error handling across the engine by:
 * - Extracting message and stack from Error instances
 * - Converting non-Error values to strings
 * - Providing a uniform error shape for logging and tracing
 * 
 * @public
 */
export const normalizeError = (err: unknown): { message: string; stack?: string } => {
    const safeToString = (v: unknown): string => {
        if (typeof v === "string") return v;
        try {
            return JSON.stringify(v);
        } catch {
            return String(v);
        }
    };

    if (err instanceof Error) {
        return { message: err.message, stack: err.stack };
    }

    if (isPlainObject(err) && "message" in err) {
        const obj = err as Record<string, unknown>;
        const stack = typeof obj.stack === "string" ? obj.stack : undefined;
        return { message: safeToString(obj.message), stack };
    }

    return { message: safeToString(err) };
};
