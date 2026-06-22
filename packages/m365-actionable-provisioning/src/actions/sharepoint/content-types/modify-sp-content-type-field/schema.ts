import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { fieldReferenceSchema } from "../_shared/reference-schema";

export const modifySPContentTypeFieldSchema = fieldReferenceSchema.safeExtend({
  verb: z.literal("modifySPContentTypeField"),
  required: z.boolean().optional(),
  hidden: z.boolean().optional(),
  readOnly: z.boolean().optional(),
  displayName: z.string().min(1).optional(),
  subactions: leafSubactionsSchema,
});

export type ModifySPContentTypeFieldPayload = z.infer<typeof modifySPContentTypeFieldSchema>;
