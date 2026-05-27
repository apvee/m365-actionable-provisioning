/**
 * Core type definitions for JSON-safe values and parameters.
 * 
 * @remarks
 * These types ensure type safety when working with JSON-serializable data structures.
 * The types support both standard JSON primitives and unknown values for compatibility
 * with dynamic runtime data and Zod parsing outputs.
 * 
 * @packageDocumentation
 */

/**
 * Primitive JSON value types.
 * 
 * @remarks
 * Includes null for JSON compatibility despite TypeScript deprecation warnings.
 * Undefined is included for optional property handling.
 * 
 * @public
 */
// eslint-disable-next-line @rushstack/no-new-null
export type JsonPrimitive = string | number | boolean | null | undefined;

/**
 * Readonly JSON object with string keys and JsonValue values.
 *
 * @remarks
 * This exists to model Zod-parsed and `as const` JSON structures
 * which commonly use readonly arrays/objects.
 *
 * @public
 */
export type JsonReadonlyObject = { readonly [k: string]: JsonValue };

/**
 * Readonly JSON array.
 *
 * @public
 */
export type JsonReadonlyArray = ReadonlyArray<JsonValue>;

/**
 * Any valid JSON value, including complex objects and arrays.
 *
 * @remarks
 * This is intentionally **strict** (does NOT include `unknown`).
 * Use `unknown` explicitly where you need to model untyped runtime values.
 *
 * @public
 */
export type JsonValue =
    | JsonPrimitive
    | JsonObject
    | JsonArray
    | JsonReadonlyObject
    | JsonReadonlyArray;

/**
 * JSON object with string keys and JsonValue values.
 * 
 * @remarks
 * Used as the base type for scopes, payloads, and other structured data.
 * 
 * @public
 */
export type JsonObject = { [k: string]: JsonValue };

/**
 * Array of JSON values.
 * 
 * @public
 */
export type JsonArray = JsonValue[];
