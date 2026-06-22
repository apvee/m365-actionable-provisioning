/**
 * Generic object utilities.
 *
 * @remarks
 * Keep these helpers dependency-free so they can be reused by any catalog/action.
 * 
 * @internal
 * @packageDocumentation
 */

/**
 * Returns a shallow copy of the input object containing only keys whose values
 * are neither `undefined` nor `null`.
 *
 * @remarks
 * Useful for building REST payloads: we avoid sending `undefined`/`null` props.
 * 
 * @internal
 */
export function pickDefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  ) as Partial<T>;
}
