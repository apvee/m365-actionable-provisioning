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

import { asSiteFieldSchema } from "../../_shared/schemas/field-variants-schemas";

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
} from "../_shared/field-base-schema";

/* ========================================
   createSPSiteColumn - Site Context Schemas
   ======================================== */

const createSPSiteColumnVerb = "createSPSiteColumn";

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
    asSiteFieldSchema(baseFieldTextSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldMultilineTextSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldNumberSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldCurrencySchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldBooleanSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldChoiceSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldMultiChoiceSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldUserSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldLookupSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldUrlSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldCalculatedSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldLocationSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldImageSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
    asSiteFieldSchema(baseFieldDateTimeSchema).extend({ verb: z.literal(createSPSiteColumnVerb) }),
]);

/**
 * Payload type for `createSPSiteColumn` action.
 */
export type CreateSPSiteColumnPayload = z.infer<typeof createSPSiteColumnSchema>;
