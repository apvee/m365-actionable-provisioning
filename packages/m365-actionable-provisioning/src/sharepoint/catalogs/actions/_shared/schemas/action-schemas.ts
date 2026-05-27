import { z } from "zod";

/**
 * Schema for leaf actions. `subactions` may be omitted, but cannot contain items.
 */
export const leafSubactionsSchema = z.array(z.never()).optional();

/**
 * Schema for child actions accepted by a parent action.
 */
export function subactionsOf<TSchema extends z.ZodType>(schema: TSchema) {
  return z.array(schema).optional();
}
