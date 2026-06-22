import { z } from "zod";

export const listViewTitleSchema = z
  .string()
  .trim()
  .min(1, "List view title cannot be empty")
  .max(255, "List view title cannot exceed 255 characters");

export const listViewFieldNameSchema = z
  .string()
  .trim()
  .min(1, "List view field reference cannot be empty")
  .max(255, "List view field reference cannot exceed 255 characters");

export const listViewFieldsSchema = z
  .array(listViewFieldNameSchema)
  .min(1, "List view fields cannot be empty")
  .refine((fields) => new Set(fields).size === fields.length, "List view fields cannot contain duplicate references")
  .optional();

function stripLeadingXmlPreamble(value: string): string {
  let remaining = value.trimStart();
  let previous = "";
  while (remaining !== previous) {
    previous = remaining;
    remaining = remaining
      .replace(/^<\?xml[\s\S]*?\?>/i, "")
      .replace(/^<!--[\s\S]*?-->/, "")
      .trimStart();
  }
  return remaining;
}

function startsWithCamlWrapper(value: string): boolean {
  const normalized = stripLeadingXmlPreamble(value).toLowerCase();
  return normalized.startsWith("<view") || normalized.startsWith("<query");
}

export const listViewQuerySchema = z
  .string()
  .trim()
  .min(1, "List view query cannot be empty")
  .refine((value) => !startsWithCamlWrapper(value), "List view query must be a CAML fragment without <View> or <Query> wrappers");

export const listViewMutableStateSchema = {
  fields: listViewFieldsSchema,
  viewQuery: listViewQuerySchema.optional(),
  rowLimit: z.number().int().min(1).max(50000).optional(),
  paged: z.boolean().optional(),
  defaultView: z.literal(true).optional(),
} as const;
