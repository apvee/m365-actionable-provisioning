import { z } from "zod";

import { nonEmptyStringSchema } from "../shared/strings.schemas";
import { asSiteFieldSchema } from "../shared/field-variants.schemas";

/* ========================================
   SHARED
   ======================================== */

const fieldNameSchema = nonEmptyStringSchema;

/* ========================================
   modifySPField
   ======================================== */

const modifySPFieldTextSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Text"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
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

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldTextSchema_Site = asSiteFieldSchema(modifySPFieldTextSchema);

const modifySPFieldMultilineTextSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("MultilineText"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
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
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldMultilineTextSchema_Site = asSiteFieldSchema(modifySPFieldMultilineTextSchema);

const modifySPFieldNumberSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Number"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
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

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldNumberSchema_Site = asSiteFieldSchema(modifySPFieldNumberSchema);

const modifySPFieldDateTimeSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("DateTime"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
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

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldDateTimeSchema_Site = asSiteFieldSchema(modifySPFieldDateTimeSchema);

const modifySPFieldBooleanSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Boolean"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
    defaultValue: z.boolean().optional(),
    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldBooleanSchema_Site = asSiteFieldSchema(modifySPFieldBooleanSchema);

const modifySPFieldChoiceSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Choice"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
    choices: z.array(z.string().min(1)).min(1).max(255).optional(),
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

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldChoiceSchema_Site = asSiteFieldSchema(modifySPFieldChoiceSchema);

const modifySPFieldMultiChoiceSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("MultiChoice"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
    choices: z.array(z.string().min(1)).min(1).max(255).optional(),
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

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldMultiChoiceSchema_Site = asSiteFieldSchema(modifySPFieldMultiChoiceSchema);

const modifySPFieldUserSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("User"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
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

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldUserSchema_Site = asSiteFieldSchema(modifySPFieldUserSchema);

const modifySPFieldLookupSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Lookup"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldLookupSchema_Site = asSiteFieldSchema(modifySPFieldLookupSchema);

const modifySPFieldUrlSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Url"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
    displayFormat: z.enum(["Hyperlink", "Image"]).optional(),

    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldUrlSchema_Site = asSiteFieldSchema(modifySPFieldUrlSchema);

const modifySPFieldCalculatedSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Calculated"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
    formula: z.string().min(1).optional(),
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

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldCalculatedSchema_Site = asSiteFieldSchema(modifySPFieldCalculatedSchema);

const modifySPFieldLocationSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Location"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldLocationSchema_Site = asSiteFieldSchema(modifySPFieldLocationSchema);

const modifySPFieldImageSchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Image"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
    group: z.string().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    hidden: z.boolean().optional(),
    enforceUniqueValues: z.boolean().optional(),
    indexed: z.boolean().optional(),
    validationFormula: z.string().optional(),
    validationMessage: z.string().optional(),

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldImageSchema_Site = asSiteFieldSchema(modifySPFieldImageSchema);

const modifySPFieldCurrencySchema = z.object({
    verb: z.literal("modifySPField"),
    subactions: z.array(z.never()).optional(),
    fieldType: z.literal("Currency"),

    // Target field (internal name or Title)
    fieldName: fieldNameSchema,

    // Updates (all optional)
    displayName: z.string().min(1).optional(),
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

    // View / form visibility
    addToDefaultView: z.boolean().optional(),
    showInDisplayForm: z.boolean().optional(),
    showInEditForm: z.boolean().optional(),
    showInNewForm: z.boolean().optional(),
});

const modifySPFieldCurrencySchema_Site = asSiteFieldSchema(modifySPFieldCurrencySchema);

export const modifySPFieldSchema = z.discriminatedUnion("fieldType", [
    modifySPFieldTextSchema,
    modifySPFieldMultilineTextSchema,
    modifySPFieldNumberSchema,
    modifySPFieldDateTimeSchema,
    modifySPFieldBooleanSchema,
    modifySPFieldChoiceSchema,
    modifySPFieldMultiChoiceSchema,
    modifySPFieldUserSchema,
    modifySPFieldLookupSchema,
    modifySPFieldUrlSchema,
    modifySPFieldCalculatedSchema,
    modifySPFieldLocationSchema,
    modifySPFieldImageSchema,
    modifySPFieldCurrencySchema,
]);

/**
 * modifySPField schema when used under list actions.
 * Includes list-only view/form options.
 */
export const modifySPFieldSchema_List = modifySPFieldSchema;

/**
 * modifySPField schema when used under site/rootWeb actions.
 * Excludes list-only view/form options.
 */
export const modifySPFieldSchema_Site = z.discriminatedUnion("fieldType", [
    modifySPFieldTextSchema_Site,
    modifySPFieldMultilineTextSchema_Site,
    modifySPFieldNumberSchema_Site,
    modifySPFieldDateTimeSchema_Site,
    modifySPFieldBooleanSchema_Site,
    modifySPFieldChoiceSchema_Site,
    modifySPFieldMultiChoiceSchema_Site,
    modifySPFieldUserSchema_Site,
    modifySPFieldLookupSchema_Site,
    modifySPFieldUrlSchema_Site,
    modifySPFieldCalculatedSchema_Site,
    modifySPFieldLocationSchema_Site,
    modifySPFieldImageSchema_Site,
    modifySPFieldCurrencySchema_Site,
]);

export type ModifySPFieldPayload = z.infer<typeof modifySPFieldSchema>;
