import { z } from "zod";

/**
 * Core JSON value contract for serializable engine output.
 *
 * @remarks
 * Runtime state such as scope and clients can contain SDK objects and must not use
 * these types. Use this module only for values that can safely be emitted in
 * snapshots, logs, audit output, and persisted JSON documents.
 *
 * @packageDocumentation
 */

/**
 * Primitive JSON value types.
 *
 * @public
 */
// eslint-disable-next-line @rushstack/no-new-null
export type JsonPrimitive = string | number | boolean | null;

/**
 * JSON object with string keys and JSON values.
 *
 * @public
 */
export type JsonObject = { readonly [key: string]: JsonValue };

/**
 * JSON array.
 *
 * @public
 */
export type JsonArray = readonly JsonValue[];

/**
 * Any valid JSON value.
 *
 * @public
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * Zod schema for runtime validation of JSON-safe values.
 *
 * @public
 */
export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
    z.union([
        z.string(),
        z.number().finite(),
        z.boolean(),
        z.null(),
        z.array(jsonValueSchema),
        z.record(z.string(), jsonValueSchema),
    ])
);

/**
 * Runtime type guard for JSON-safe values.
 *
 * @public
 */
export const isJsonValue = (value: unknown): value is JsonValue =>
    jsonValueSchema.safeParse(value).success;
