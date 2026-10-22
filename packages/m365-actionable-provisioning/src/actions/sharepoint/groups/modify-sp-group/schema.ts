import { z } from "zod";
import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { spGroupNameSchema, spGroupReferenceFields, validateSPGroupReference } from "../_shared/schema";

/** Updates declared group properties. Use an ID for repeatable renames. */
export const modifySPGroupSchema = z.object({
  verb: z.literal("modifySPGroup"),
  ...spGroupReferenceFields,
  title: spGroupNameSchema.optional(),
  description: z.string().optional(),
  subactions: leafSubactionsSchema,
}).strict().superRefine(validateSPGroupReference);

export type ModifySPGroupPayload = z.infer<typeof modifySPGroupSchema>;
