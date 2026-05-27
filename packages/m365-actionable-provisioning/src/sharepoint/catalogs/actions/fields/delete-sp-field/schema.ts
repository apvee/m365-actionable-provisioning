import { z } from "zod";

/* ========================================
   deleteSPField
   ======================================== */

export const deleteSPFieldSchema = z
  .object({
    verb: z.literal("deleteSPField"),

    // Target field
    fieldName: z.string().min(1).optional(),
    fieldId: z.string().min(1).optional(),

    subactions: z.array(z.never()).optional(),
  })
  .refine((v) => Boolean(v.fieldId || v.fieldName), {
    message: "Either fieldId or fieldName must be provided",
  });

export type DeleteSPFieldPayload = z.infer<typeof deleteSPFieldSchema>;

/** deleteSPField schema under list actions (same shape as base) */
export const deleteSPFieldSchema_List = deleteSPFieldSchema;

/** deleteSPField schema under site/rootWeb actions (same shape as base) */
export const deleteSPFieldSchema_Site = deleteSPFieldSchema;
