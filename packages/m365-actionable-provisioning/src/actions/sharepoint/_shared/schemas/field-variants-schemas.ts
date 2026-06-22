import { z } from "zod";

/**
 * Shared field schema variants.
 *
 * @remarks
 * Fields can be created/modified at:
 * - List scope: may include view/form visibility options
 * - Site (web) scope: must forbid list-only view/form keys and be strict
 */

export const listOnlyViewFormKeys = {
  addToDefaultView: true,
  showInDisplayForm: true,
  showInEditForm: true,
  showInNewForm: true,
} as const;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const asSiteFieldSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.omit(listOnlyViewFormKeys).strict();
