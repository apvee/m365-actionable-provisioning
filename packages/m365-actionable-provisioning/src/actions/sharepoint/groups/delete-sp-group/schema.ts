import { z } from "zod";
import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { spGroupReferenceFields, validateSPGroupReference } from "../_shared/schema";

/** Ensures the referenced SharePoint site collection group is absent. */
export const deleteSPGroupSchema = z.object({
  verb: z.literal("deleteSPGroup"),
  ...spGroupReferenceFields,
  subactions: leafSubactionsSchema,
}).strict().superRefine(validateSPGroupReference);

export type DeleteSPGroupPayload = z.infer<typeof deleteSPGroupSchema>;
