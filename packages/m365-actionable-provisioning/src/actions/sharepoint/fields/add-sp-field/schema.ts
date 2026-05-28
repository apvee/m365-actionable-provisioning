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
} from "../_shared/field-base-schema";

/* ========================================
   addSPField - List Context Schemas
   ======================================== */

const addSPFieldVerb = "addSPField";

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
    baseFieldTextSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldMultilineTextSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldNumberSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldCurrencySchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldBooleanSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldChoiceSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldMultiChoiceSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldUserSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldLookupSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldUrlSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldCalculatedSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldLocationSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldImageSchema.extend({ verb: z.literal(addSPFieldVerb) }),
    baseFieldDateTimeSchema.extend({ verb: z.literal(addSPFieldVerb) }),
]);

/**
 * Payload type for `addSPField` action.
 */
export type AddSPFieldPayload = z.infer<typeof addSPFieldSchema>;
