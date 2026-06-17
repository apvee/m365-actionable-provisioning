import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";

export const contentTypeIdSchema = z.string().min(1);
export const contentTypeNameSchema = z.string().min(1);
export const fieldIdSchema = z.string().min(1);
export const fieldNameSchema = z.string().min(1);

export const contentTypeReferenceSchema = z.object({
  contentTypeId: contentTypeIdSchema.optional(),
  contentTypeName: contentTypeNameSchema.optional(),
}).refine(
  (value) => value.contentTypeId !== undefined || value.contentTypeName !== undefined,
  { message: "Either contentTypeId or contentTypeName must be provided" }
);

export const fieldReferenceSchema = z.object({
  fieldId: fieldIdSchema.optional(),
  fieldName: fieldNameSchema.optional(),
}).refine(
  (value) => value.fieldId !== undefined || value.fieldName !== undefined,
  { message: "Either fieldId or fieldName must be provided" }
);

export const graphTargetSchema = z.object({
  siteUrl: z.string().url().optional(),
  webUrl: z.string().url().optional(),
});

export const contentTypeLeafSubactionsSchema = leafSubactionsSchema;
