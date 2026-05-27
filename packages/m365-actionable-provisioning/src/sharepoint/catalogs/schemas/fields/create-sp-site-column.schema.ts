/**
 * createSPSiteColumn schema - for site context.
 *
 * @remarks
 * This schema is used when creating site columns (fields at the web level).
 * It excludes list-only properties like `addToDefaultView`, `showInDisplayForm`, etc.
 *
 * Aligns with SharePoint's `createSiteColumn` verb in site scripts
 * (with `SP` prefix for library consistency).
 *
 * @packageDocumentation
 */

import { z } from "zod";

import { asSiteFieldSchema } from "../shared/field-variants.schemas";

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
   createSPSiteColumn - Site Context Schemas
   ======================================== */

const createSPSiteColumnTextSchema = asSiteFieldSchema(baseFieldTextSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnMultilineTextSchema = asSiteFieldSchema(baseFieldMultilineTextSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnNumberSchema = asSiteFieldSchema(baseFieldNumberSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnCurrencySchema = asSiteFieldSchema(baseFieldCurrencySchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnBooleanSchema = asSiteFieldSchema(baseFieldBooleanSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnChoiceSchema = asSiteFieldSchema(baseFieldChoiceSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnMultiChoiceSchema = asSiteFieldSchema(baseFieldMultiChoiceSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnUserSchema = asSiteFieldSchema(baseFieldUserSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnLookupSchema = asSiteFieldSchema(baseFieldLookupSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnUrlSchema = asSiteFieldSchema(baseFieldUrlSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnCalculatedSchema = asSiteFieldSchema(baseFieldCalculatedSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnLocationSchema = asSiteFieldSchema(baseFieldLocationSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnImageSchema = asSiteFieldSchema(baseFieldImageSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

const createSPSiteColumnDateTimeSchema = asSiteFieldSchema(baseFieldDateTimeSchema).extend({
    verb: z.literal("createSPSiteColumn"),
});

/* ========================================
   EXPORTED SCHEMAS
   ======================================== */

/**
 * Schema for `createSPSiteColumn` action (site context).
 *
 * @remarks
 * Excludes list-only properties via `asSiteFieldSchema()`:
 * - No `addToDefaultView`
 * - No `showInDisplayForm`
 * - No `showInEditForm`
 * - No `showInNewForm`
 */
export const createSPSiteColumnSchema = z.discriminatedUnion("fieldType", [
    createSPSiteColumnTextSchema,
    createSPSiteColumnMultilineTextSchema,
    createSPSiteColumnNumberSchema,
    createSPSiteColumnCurrencySchema,
    createSPSiteColumnBooleanSchema,
    createSPSiteColumnChoiceSchema,
    createSPSiteColumnMultiChoiceSchema,
    createSPSiteColumnUserSchema,
    createSPSiteColumnLookupSchema,
    createSPSiteColumnUrlSchema,
    createSPSiteColumnCalculatedSchema,
    createSPSiteColumnLocationSchema,
    createSPSiteColumnImageSchema,
    createSPSiteColumnDateTimeSchema,
]);

/**
 * Alias for site subaction usage.
 * @deprecated Use `createSPSiteColumnSchema` directly.
 */
export const createSPSiteColumnSchema_Site = createSPSiteColumnSchema;

/**
 * Payload type for `createSPSiteColumn` action.
 */
export type CreateSPSiteColumnPayload = z.infer<typeof createSPSiteColumnSchema>;

