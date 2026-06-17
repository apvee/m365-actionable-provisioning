import { z } from "zod";

export const listViewTitleSchema = z
  .string()
  .min(1, "List view title cannot be empty")
  .max(255, "List view title cannot exceed 255 characters");

export const listViewFieldNameSchema = z
  .string()
  .min(1, "List view field name cannot be empty")
  .max(255, "List view field name cannot exceed 255 characters");

export const listViewFieldsSchema = z
  .array(listViewFieldNameSchema)
  .min(1, "List view fields cannot be empty")
  .optional();

export const listViewScopeSchema = z.enum(["default", "recursive", "recursiveAll", "filesOnly"]);

const listViewQuerySchema = z.string().refine((value) => {
  const normalized = value.trim().toLowerCase();
  return !normalized.startsWith("<view") && !normalized.startsWith("<query");
}, "List view query must be a CAML Query fragment such as <Where> or <OrderBy>, without <View> or <Query> wrappers");

export const listViewMutableStateSchema = {
  fields: listViewFieldsSchema,
  viewQuery: listViewQuerySchema.optional(),
  rowLimit: z.number().int().min(1).max(50000).optional(),
  paged: z.boolean().optional(),
  defaultView: z.boolean().optional(),
  tabularView: z.boolean().optional(),
  scope: listViewScopeSchema.optional(),
} as const;
