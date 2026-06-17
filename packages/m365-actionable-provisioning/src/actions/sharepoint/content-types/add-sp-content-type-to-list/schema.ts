import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { contentTypeReferenceSchema } from "../_shared/reference-schema";

export const addSPContentTypeToListSchema = contentTypeReferenceSchema.safeExtend({
  verb: z.literal("addSPContentTypeToList"),
  subactions: leafSubactionsSchema,
});

export type AddSPContentTypeToListPayload = z.infer<typeof addSPContentTypeToListSchema>;
