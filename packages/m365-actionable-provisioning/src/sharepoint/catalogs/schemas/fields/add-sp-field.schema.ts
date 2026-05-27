/**
 * addSPField schema - for list context.
 *
 * @remarks
 * This schema is used when creating fields within SharePoint lists.
 * It includes list-only properties like `addToDefaultView`, `showInDisplayForm`, etc.
 *
 * Aligns with SharePoint's `addSPField` verb in site scripts.
 *
 * @packageDocumentation
 */

import { z } from "zod";

import {
    baseFieldTextSchema,
    baseFieldMultilineTextSchema,
    baseFieldNumberSchema,
    baseFieldCurrencySchema,
    baseFieldBooleanSchema,
    baseFieldChoiceSchema,
    baseFieldMultiChoiceSchema,
    baseFieldUserSchema,
    baseFieldLookupSchema,
    baseFieldUrlSchema,
    baseFieldCalculatedSchema,
    baseFieldLocationSchema,
    baseFieldImageSchema,
    baseFieldDateTimeSchema,
} from "./field-base.schema";

/* ========================================
   addSPField - List Context Schemas
   ======================================== */

const addSPFieldTextSchema = baseFieldTextSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldMultilineTextSchema = baseFieldMultilineTextSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldNumberSchema = baseFieldNumberSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldCurrencySchema = baseFieldCurrencySchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldBooleanSchema = baseFieldBooleanSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldChoiceSchema = baseFieldChoiceSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldMultiChoiceSchema = baseFieldMultiChoiceSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldUserSchema = baseFieldUserSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldLookupSchema = baseFieldLookupSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldUrlSchema = baseFieldUrlSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldCalculatedSchema = baseFieldCalculatedSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldLocationSchema = baseFieldLocationSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldImageSchema = baseFieldImageSchema.extend({
    verb: z.literal("addSPField"),
});

const addSPFieldDateTimeSchema = baseFieldDateTimeSchema.extend({
    verb: z.literal("addSPField"),
});

/* ========================================
   EXPORTED SCHEMAS
   ======================================== */

/**
 * Schema for `addSPField` action (list context).
 *
 * @remarks
 * Includes all field types with list-specific options:
 * - `addToDefaultView`
 * - `showInDisplayForm`
 * - `showInEditForm`
 * - `showInNewForm`
 */
export const addSPFieldSchema = z.discriminatedUnion("fieldType", [
    addSPFieldTextSchema,
    addSPFieldMultilineTextSchema,
    addSPFieldNumberSchema,
    addSPFieldCurrencySchema,
    addSPFieldBooleanSchema,
    addSPFieldChoiceSchema,
    addSPFieldMultiChoiceSchema,
    addSPFieldUserSchema,
    addSPFieldLookupSchema,
    addSPFieldUrlSchema,
    addSPFieldCalculatedSchema,
    addSPFieldLocationSchema,
    addSPFieldImageSchema,
    addSPFieldDateTimeSchema,
]);

/**
 * Alias for list subaction usage.
 * @deprecated Use `addSPFieldSchema` directly.
 */
export const addSPFieldSchema_List = addSPFieldSchema;

/**
 * Payload type for `addSPField` action.
 */
export type AddSPFieldPayload = z.infer<typeof addSPFieldSchema>;

