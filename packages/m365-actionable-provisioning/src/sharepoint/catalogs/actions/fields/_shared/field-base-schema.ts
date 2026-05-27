/**
 * Base field schemas WITHOUT verb property.
 *
 * @remarks
 * These schemas define the field-type-specific properties shared by both
 * `addSPField` (list context) and `createSPSiteColumn` (site context).
 *
 * The verb-specific schemas in `add-sp-field.schema.ts` and
 * `create-sp-site-column.schema.ts` extend these base schemas by adding
 * the appropriate verb literal.
 *
 * @packageDocumentation
 */

import { z } from "zod";

import { nonEmptyStringSchema } from "../shared/strings.schemas";

/* ========================================
   SHARED FIELD PRIMITIVES
   ======================================== */

export const fieldNameSchema = nonEmptyStringSchema;
export const displayNameSchema = nonEmptyStringSchema;

/* ========================================
   BASE FIELD SCHEMAS (without verb)
   ======================================== */

/**
 * Base schema for Text fields (without verb).
 */
export const baseFieldTextSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Text"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    maxLength: z.number().int().min(1).max(255).optional(),
    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    defaultValue: z.string().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),

    // Advanced: allow a fixed GUID when needed (optional)
    id: z.string().optional(),

    // View / form visibility (list-only, will be omitted for site columns)
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for MultilineText fields (without verb).
 */
export const baseFieldMultilineTextSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("MultilineText"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    numberOfLines: z.number().int().min(1).max(50).optional(),
    richText: z.boolean().optional(),
    appendOnly: z.boolean().optional(),
    allowHyperlink: z.boolean().optional(),
    restrictedMode: z.boolean().optional(),

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    defaultValue: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for Number fields (without verb).
 */
export const baseFieldNumberSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Number"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    minimumValue: z.number().optional(),
    maximumValue: z.number().optional(),
    showAsPercentage: z.boolean().optional(),
    defaultValue: z.number().optional(),

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for Currency fields (without verb).
 */
export const baseFieldCurrencySchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Currency"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    minimumValue: z.number().optional(),
    maximumValue: z.number().optional(),
    currencyLocaleId: z.number().int().optional(),
    defaultValue: z.number().optional(),

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for Boolean fields (without verb).
 */
export const baseFieldBooleanSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Boolean"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    defaultValue: z.boolean().optional(),
    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for Choice fields (without verb).
 */
export const baseFieldChoiceSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Choice"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    choices: z.array(z.string().min(1)).min(1).max(255),
    fillInChoice: z.boolean().optional(),
    editFormat: z.enum(["Dropdown", "RadioButtons"]).optional(),
    defaultChoice: z.string().optional(),

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for MultiChoice fields (without verb).
 */
export const baseFieldMultiChoiceSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("MultiChoice"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    choices: z.array(z.string().min(1)).min(1).max(255),
    fillInChoice: z.boolean().optional(),
    defaultValue: z.array(z.string().min(1)).optional(),

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for User fields (without verb).
 */
export const baseFieldUserSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("User"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    selectionMode: z.enum(["PeopleOnly", "PeopleAndGroups"]).optional(),
    allowMultipleValues: z.boolean().optional(),
    selectionGroup: z.number().int().optional(),
    presence: z.boolean().optional(),

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for Lookup fields (without verb).
 */
export const baseFieldLookupSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Lookup"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    // Target list for the lookup (provide either name or id)
    lookupListName: z.string().min(1).optional(),
    lookupListId: z.string().uuid().optional(),

    // Lookup target web (optional)
    lookupWebId: z.string().uuid().optional(),

    // Which field to show from the lookup list (defaults to Title)
    showField: z.string().min(1).optional(),

    // Post-create configuration
    allowMultipleValues: z.boolean().optional(),
    relationshipDeleteBehavior: z.enum(["None", "Cascade", "Restrict"]).optional(),
    dependentLookupFields: z.array(z.string().min(1)).optional(),

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for Url fields (without verb).
 */
export const baseFieldUrlSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Url"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    displayFormat: z.enum(["Hyperlink", "Image"]).optional(),
    defaultValue: z.string().optional(),

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for Calculated fields (without verb).
 */
export const baseFieldCalculatedSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Calculated"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    formula: z.string().min(1),
    outputType: z.enum(["Text", "Number", "Currency", "DateTime", "Boolean"]).optional(),
    dateFormat: z.enum(["DateOnly", "DateTime"]).optional(),

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for Location fields (without verb).
 */
export const baseFieldLocationSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Location"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for Image fields (without verb).
 */
export const baseFieldImageSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Image"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/**
 * Base schema for DateTime fields (without verb).
 */
export const baseFieldDateTimeSchema = z.object({
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("DateTime"),
    fieldName: fieldNameSchema,
    displayName: displayNameSchema,

    displayFormat: z.enum(["DateOnly", "DateTime"]).optional(),
    friendlyDisplayFormat: z.enum(["Unspecified", "Disabled", "Relative"]).optional(),
    calendarType: z
        .enum([
            "Gregorian",
            "Japan",
            "Taiwan",
            "Korea",
            "Hijri",
            "Thai",
            "Hebrew",
            "GregorianMEFrench",
            "GregorianArabic",
            "GregorianXLITEnglish",
            "GregorianXLITFrench",
            "KoreaJapanLunar",
            "ChineseLunar",
            "SakaEra",
            "UmAlQura",
        ])
        .optional(),

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    defaultValue: z.string().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),
    id: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

/* ========================================
   BASE FIELD TYPE UNION (for typing)
   ======================================== */

/**
 * All base field schemas as an array (for discriminatedUnion).
 * These do NOT include the verb property.
 */
export const allBaseFieldSchemas = [
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
] as const;

/**
 * Base field payload type (without verb).
 */
export type BaseFieldPayload = z.infer<typeof baseFieldTextSchema>
    | z.infer<typeof baseFieldMultilineTextSchema>
    | z.infer<typeof baseFieldNumberSchema>
    | z.infer<typeof baseFieldCurrencySchema>
    | z.infer<typeof baseFieldBooleanSchema>
    | z.infer<typeof baseFieldChoiceSchema>
    | z.infer<typeof baseFieldMultiChoiceSchema>
    | z.infer<typeof baseFieldUserSchema>
    | z.infer<typeof baseFieldLookupSchema>
    | z.infer<typeof baseFieldUrlSchema>
    | z.infer<typeof baseFieldCalculatedSchema>
    | z.infer<typeof baseFieldLocationSchema>
    | z.infer<typeof baseFieldImageSchema>
    | z.infer<typeof baseFieldDateTimeSchema>;

