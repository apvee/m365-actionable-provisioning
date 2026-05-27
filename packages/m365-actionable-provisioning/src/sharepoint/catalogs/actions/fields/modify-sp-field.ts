/**
 * ModifySPField action definition.
 *
 * @remarks
 * Modifies a SharePoint field.
 *
 * Target container is determined by scope:
 * - If `scopeIn.list` exists: list field
 * - Else: root web site column (uses `scopeIn.web`)
 *
 * The Zod schema for this action is defined in `catalogs/schemas/fields`.
 */

import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { SPScope, SPRuntimeContext, SPActionResult } from "../../../types";
import { normalizeError } from "../../../../core";
import { pickDefined } from "../../../utils/object-utils";

import { modifySPFieldSchema, type ModifySPFieldPayload } from "../../schemas/fields/modify-sp-field.schema";

import {
    ChoiceFieldFormatType,
    CalendarType,
    DateTimeFieldFormatType,
    DateTimeFieldFriendlyFormatType,
    FieldUserSelectionMode,
    FieldTypes,
    UrlFieldFormatType,
} from "@pnp/sp/fields/types.js";

import "@pnp/sp/fields";
import "@pnp/sp/lists";

import {
    applyFieldViewSettings,
    getFieldByNameOrTitle,
} from "./field-utils";

/* ========================================
   ACTION DEFINITION
   ======================================== */

/**
 * Action definition for modifying SharePoint fields.
 * @public
 */
export class ModifySPFieldAction extends ActionDefinition<
    "modifySPField",
    typeof modifySPFieldSchema,
    SPScope
> {
    readonly verb = "modifySPField";
    readonly actionSchema = modifySPFieldSchema;

    override async handler(ctx: SPRuntimeContext<ModifySPFieldPayload>): Promise<SPActionResult> {
        const def = ctx.action.payload;
        const resource = def.fieldName;

        const scopeIn = ctx.scopeIn;

        const list = scopeIn.list;
        const web = scopeIn.web;
        const listOrWeb = list ?? web;

        if (!listOrWeb) {
            return {
                result: {
                    outcome: "skipped",
                    resource,
                    reason: "missing_prerequisite",
                },
            };
        }

        // Step 1: resolve field
        const fieldInfo = await getFieldByNameOrTitle(listOrWeb, def.fieldName);
        if (!fieldInfo) {
            return {
                result: {
                    outcome: "skipped",
                    resource,
                    reason: "not_found",
                },
            };
        }

        // Step 2: build update props (route by fieldType)
        const updateTypeName: string | undefined =
            def.fieldType === "Currency"
                ? "SP.FieldCurrency"
                : def.fieldType === "DateTime"
                    ? "SP.FieldDateTime"
                    : def.fieldType === "User"
                        ? "SP.FieldUser"
                        : def.fieldType === "Lookup"
                            ? "SP.FieldLookup"
                            : undefined;

        const updateProps = (() => {
            switch (def.fieldType) {
                case "Text":
                    return pickDefined({
                        Title: def.displayName,
                        MaxLength: def.maxLength,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        DefaultValue: def.defaultValue,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                case "MultilineText":
                    // OLD handler updates these properties; we also accept a few safe extras.
                    return pickDefined({
                        Title: def.displayName,
                        NumberOfLines: def.numberOfLines,
                        RichText: def.richText,
                        RestrictedMode: def.restrictedMode,
                        AppendOnly: def.appendOnly,
                        AllowHyperlink: def.allowHyperlink,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        DefaultValue: def.defaultValue,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                case "Number":
                    return pickDefined({
                        MinimumValue: def.minimumValue,
                        MaximumValue: def.maximumValue,
                        ShowAsPercentage: def.showAsPercentage,
                        // SharePoint expects DefaultValue as Edm.String even for numeric fields
                        DefaultValue: def.defaultValue !== undefined ? String(def.defaultValue) : undefined,
                        Title: def.displayName,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                case "Currency":
                    return pickDefined({
                        MinimumValue: def.minimumValue,
                        MaximumValue: def.maximumValue,
                        CurrencyLocaleId: def.currencyLocaleId,
                        // SharePoint expects DefaultValue as Edm.String even for numeric fields
                        DefaultValue: def.defaultValue !== undefined ? String(def.defaultValue) : undefined,
                        Title: def.displayName,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                case "Boolean":
                    return pickDefined({
                        DefaultValue:
                            def.defaultValue !== undefined ? (def.defaultValue ? "1" : "0") : undefined,
                        Title: def.displayName,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                    });

                case "Choice":
                    return pickDefined({
                        Choices: def.choices,
                        EditFormat:
                            def.editFormat !== undefined ? ChoiceFieldFormatType[def.editFormat] : undefined,
                        FillInChoice: def.fillInChoice,
                        DefaultValue: def.defaultChoice,
                        Title: def.displayName,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                case "MultiChoice": {
                    // Convert array defaultValue to SharePoint format (';#' delimited)
                    let defaultValueString: string | undefined;
                    if (def.defaultValue !== undefined) {
                        defaultValueString = def.defaultValue.length > 0 ? def.defaultValue.join(";#") : "";
                    }

                    return pickDefined({
                        Title: def.displayName,
                        Choices: def.choices,
                        FillInChoice: def.fillInChoice,
                        DefaultValue: defaultValueString,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });
                }

                case "User":
                    return pickDefined({
                        SelectionMode:
                            def.selectionMode !== undefined
                                ? FieldUserSelectionMode[def.selectionMode]
                                : undefined,
                        AllowMultipleValues: def.allowMultipleValues,
                        Presence: def.presence,
                        SelectionGroup: def.selectionGroup,

                        Title: def.displayName,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                case "Lookup":
                    // Align to OLD: do not attempt to change lookup target list/showField/etc.
                    return pickDefined({
                        Title: def.displayName,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                case "Url":
                    return pickDefined({
                        DisplayFormat:
                            def.displayFormat !== undefined ? UrlFieldFormatType[def.displayFormat] : undefined,
                        Title: def.displayName,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                case "Calculated":
                    return pickDefined({
                        Formula: def.formula,
                        OutputType: def.outputType !== undefined ? FieldTypes[def.outputType] : undefined,
                        DateFormat: def.dateFormat !== undefined ? DateTimeFieldFormatType[def.dateFormat] : undefined,
                        Title: def.displayName,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                case "Location":
                    return pickDefined({
                        Title: def.displayName,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                case "Image":
                    return pickDefined({
                        Title: def.displayName,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                case "DateTime":
                    return pickDefined({
                        DisplayFormat:
                            def.displayFormat !== undefined
                                ? DateTimeFieldFormatType[def.displayFormat]
                                : undefined,
                        DateTimeCalendarType:
                            def.calendarType !== undefined ? CalendarType[def.calendarType] : undefined,
                        FriendlyDisplayFormat:
                            def.friendlyDisplayFormat !== undefined
                                ? DateTimeFieldFriendlyFormatType[def.friendlyDisplayFormat]
                                : undefined,

                        Title: def.displayName,
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        DefaultValue: def.defaultValue,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                    });

                default:
                    throw new Error("Unsupported fieldType");
            }
        })();

        const hasPropertyUpdates = Object.keys(updateProps).length > 0;
        const hasVisibilityUpdates =
            list !== undefined &&
            (def.addToDefaultView !== undefined ||
                def.showInDisplayForm !== undefined ||
                def.showInEditForm !== undefined ||
                def.showInNewForm !== undefined);

        if (!hasPropertyUpdates && !hasVisibilityUpdates) {
            return {
                result: {
                    outcome: "skipped",
                    resource,
                    reason: "no_changes",
                },
            };
        }

        // Step 3: apply updates
        const field = listOrWeb.fields.getById(fieldInfo.Id);

        if (hasPropertyUpdates) {
            if (updateTypeName) {
                await (field as {
                    update: (props: Record<string, unknown>, typeName: string) => Promise<unknown>;
                }).update(updateProps as Record<string, unknown>, updateTypeName);
            } else {
                await field.update(updateProps);
            }
        }


        if (hasVisibilityUpdates) {
            if (!list) {
                throw new Error("List scope required for visibility updates but not available");
            }
            await applyFieldViewSettings(list, fieldInfo.InternalName, {
                addToDefaultView: def.addToDefaultView,
                showInDisplayForm: def.showInDisplayForm,
                showInEditForm: def.showInEditForm,
                showInNewForm: def.showInNewForm,
            });
        }

        ctx.logger.info("Field modified", {
            container: list ? "list" : "web",
            fieldId: fieldInfo.Id,
            fieldName: fieldInfo.InternalName,
            fieldType: def.fieldType,
            propertiesUpdated: Object.keys(updateProps),
        });

        return {
            result: {
                outcome: "executed",
                resource,
            },
        };
    }

    override async checkCompliance(
        ctx: ComplianceRuntimeContext<SPScope, ModifySPFieldPayload>
    ): Promise<ComplianceActionCheckResult<SPScope>> {
        const def = ctx.action.payload;
        const resource = def.fieldName;

        const list = ctx.scopeIn.list;
        const web = ctx.scopeIn.web;
        const listOrWeb = list ?? web;

        if (!listOrWeb) {
            return { outcome: "unverifiable", resource, reason: "missing_prerequisite" };
        }

        const fieldInfo = await getFieldByNameOrTitle(listOrWeb, def.fieldName);
        if (!fieldInfo) {
            return { outcome: "unverifiable", resource, reason: "not_found" };
        }

        const expected: Record<string, unknown> = {};

        type PnPSelectable = {
            select: (...k: string[]) => () => Promise<Record<string, unknown>>;
        };

        const addCommon = (opts: {
            displayName?: string;
            group?: string;
            required?: boolean;
            description?: string;
            hidden?: boolean;
            enforceUniqueValues?: boolean;
            indexed?: boolean;
            validationFormula?: string;
            validationMessage?: string;
            defaultValue?: unknown;
        }): void => {
            if (opts.displayName !== undefined) expected.Title = opts.displayName;
            if (opts.group !== undefined) expected.Group = opts.group;
            if (opts.required !== undefined) expected.Required = opts.required;
            if (opts.description !== undefined) expected.Description = opts.description;
            if (opts.hidden !== undefined) expected.Hidden = opts.hidden;
            if (opts.enforceUniqueValues !== undefined) expected.EnforceUniqueValues = opts.enforceUniqueValues;
            if (opts.indexed !== undefined) expected.Indexed = opts.indexed;
            if (opts.validationFormula !== undefined) expected.ValidationFormula = opts.validationFormula;
            if (opts.validationMessage !== undefined) expected.ValidationMessage = opts.validationMessage;
            if (opts.defaultValue !== undefined) expected.DefaultValue = opts.defaultValue;
        };

        switch (def.fieldType) {
            case "Text":
                if (def.maxLength !== undefined) expected.MaxLength = def.maxLength;
                addCommon(def);
                break;

            case "MultilineText":
                if (def.numberOfLines !== undefined) expected.NumberOfLines = def.numberOfLines;
                if (def.richText !== undefined) expected.RichText = def.richText;
                if (def.restrictedMode !== undefined) expected.RestrictedMode = def.restrictedMode;
                if (def.appendOnly !== undefined) expected.AppendOnly = def.appendOnly;
                if (def.allowHyperlink !== undefined) expected.AllowHyperlink = def.allowHyperlink;
                addCommon(def);
                break;

            case "Number":
                if (def.minimumValue !== undefined) expected.MinimumValue = def.minimumValue;
                if (def.maximumValue !== undefined) expected.MaximumValue = def.maximumValue;
                if (def.showAsPercentage !== undefined) expected.ShowAsPercentage = def.showAsPercentage;
                if (def.defaultValue !== undefined) expected.DefaultValue = String(def.defaultValue);
                addCommon({
                    ...def,
                    defaultValue: def.defaultValue !== undefined ? String(def.defaultValue) : undefined,
                });
                break;

            case "Currency":
                if (def.minimumValue !== undefined) expected.MinimumValue = def.minimumValue;
                if (def.maximumValue !== undefined) expected.MaximumValue = def.maximumValue;
                if (def.currencyLocaleId !== undefined) expected.CurrencyLocaleId = def.currencyLocaleId;
                if (def.defaultValue !== undefined) expected.DefaultValue = String(def.defaultValue);
                addCommon({
                    ...def,
                    defaultValue: def.defaultValue !== undefined ? String(def.defaultValue) : undefined,
                });
                break;

            case "Boolean":
                if (def.defaultValue !== undefined) expected.DefaultValue = def.defaultValue ? "1" : "0";
                addCommon({
                    ...def,
                    defaultValue: def.defaultValue !== undefined ? (def.defaultValue ? "1" : "0") : undefined,
                });
                break;

            case "Choice":
                if (def.choices !== undefined) expected.Choices = def.choices;
                if (def.fillInChoice !== undefined) expected.FillInChoice = def.fillInChoice;
                if (def.editFormat !== undefined) expected.EditFormat = ChoiceFieldFormatType[def.editFormat];
                if (def.defaultChoice !== undefined) expected.DefaultValue = def.defaultChoice;
                addCommon(def);
                break;

            case "MultiChoice": {
                if (def.choices !== undefined) expected.Choices = def.choices;
                if (def.fillInChoice !== undefined) expected.FillInChoice = def.fillInChoice;
                if (def.defaultValue !== undefined) expected.DefaultValue = def.defaultValue.length > 0 ? def.defaultValue.join(";#") : "";
                addCommon({
                    ...def,
                    defaultValue:
                        def.defaultValue !== undefined ? (def.defaultValue.length > 0 ? def.defaultValue.join(";#") : "") : undefined,
                });
                break;
            }

            case "User":
                if (def.selectionMode !== undefined) expected.SelectionMode = FieldUserSelectionMode[def.selectionMode];
                if (def.allowMultipleValues !== undefined) expected.AllowMultipleValues = def.allowMultipleValues;
                if (def.presence !== undefined) expected.Presence = def.presence;
                if (def.selectionGroup !== undefined) expected.SelectionGroup = def.selectionGroup;
                addCommon(def);
                break;

            case "Lookup":
                // Align to action: do not attempt to validate lookup target list/showField.
                addCommon(def);
                break;

            case "Url":
                if (def.displayFormat !== undefined) expected.DisplayFormat = UrlFieldFormatType[def.displayFormat];
                addCommon(def);
                break;

            case "DateTime":
                if (def.displayFormat !== undefined) expected.DisplayFormat = DateTimeFieldFormatType[def.displayFormat];
                if (def.calendarType !== undefined) expected.DateTimeCalendarType = CalendarType[def.calendarType];
                if (def.friendlyDisplayFormat !== undefined) expected.FriendlyDisplayFormat = DateTimeFieldFriendlyFormatType[def.friendlyDisplayFormat];
                addCommon(def);
                break;

            default:
                addCommon(def as {
                    displayName?: string;
                    group?: string;
                    required?: boolean;
                    description?: string;
                    hidden?: boolean;
                    enforceUniqueValues?: boolean;
                    indexed?: boolean;
                    validationFormula?: string;
                    validationMessage?: string;
                    defaultValue?: unknown;
                });
                break;
        }

        const selectKeys = Object.keys(expected);
        const visibilityKeysProvided =
            list !== undefined &&
            (def.addToDefaultView !== undefined ||
                def.showInDisplayForm !== undefined ||
                def.showInEditForm !== undefined ||
                def.showInNewForm !== undefined);

        if (selectKeys.length === 0 && !visibilityKeysProvided) {
            return { outcome: "compliant", resource, reason: "no_changes" };
        }

        try {
            if (selectKeys.length > 0) {
                const field = listOrWeb.fields.getById(fieldInfo.Id);
                const actual = (await (field as typeof field & PnPSelectable).select(
                    ...selectKeys
                )()) as Record<string, unknown>;

                const normalizeComparable = (v: unknown): unknown => {
                    if (!v || typeof v !== "object" || Array.isArray(v)) return v;

                    // Some SharePoint responses may wrap arrays as { results: [] }.
                    if ("results" in v) {
                        const maybeResults = (v as { results?: unknown }).results;
                        if (Array.isArray(maybeResults)) return maybeResults;
                    }

                    return v;
                };

                const areEqual = (left: unknown, right: unknown): boolean => {
                    const a = normalizeComparable(left);
                    const b = normalizeComparable(right);

                    if ((a === null || a === undefined) && (b === null || b === undefined)) return true;

                    if (Array.isArray(a) && Array.isArray(b)) {
                        if (a.length !== b.length) return false;
                        for (let i = 0; i < a.length; i += 1) {
                            if (!areEqual(a[i], b[i])) return false;
                        }
                        return true;
                    }

                    // For this action, expected/actual are mostly primitives; keep non-array objects strict.
                    return Object.is(a, b);
                };

                const mismatches: Array<{ key: string; expected: unknown; actual: unknown }> = [];
                for (const key of selectKeys) {
                    const exp = expected[key];
                    const act = actual[key];

                    // Important: array-valued props (e.g. Choices) must be compared by value.
                    if (!areEqual(act, exp)) mismatches.push({ key, expected: exp, actual: act });
                }
                if (mismatches.length > 0) {
                    return { outcome: "non_compliant", resource, reason: "mismatch", details: { mismatches } };
                }
            }

            if (visibilityKeysProvided) {
                const visibilityMismatches: Array<{ key: string; expected: unknown; actual: unknown }> = [];

                if (def.addToDefaultView !== undefined) {
                    try {
                        if (!list) {
                            visibilityMismatches.push({ key: "addToDefaultView", expected: def.addToDefaultView, actual: "unverifiable (no list scope)" });
                        } else {
                            const viewFields = await list.defaultView.fields();
                            const items = (viewFields as { Items?: unknown }).Items;
                            const exists = Array.isArray(items) && items.includes(fieldInfo.InternalName);
                            if (exists !== def.addToDefaultView) {
                                visibilityMismatches.push({ key: "addToDefaultView", expected: def.addToDefaultView, actual: exists });
                            }
                        }
                    } catch {
                        // best-effort in the action
                        visibilityMismatches.push({ key: "addToDefaultView", expected: def.addToDefaultView, actual: "unverifiable" });
                    }
                }

                const formKeys: Array<["ShowInDisplayForm" | "ShowInEditForm" | "ShowInNewForm", boolean | undefined]> = [
                    ["ShowInDisplayForm", def.showInDisplayForm],
                    ["ShowInEditForm", def.showInEditForm],
                    ["ShowInNewForm", def.showInNewForm],
                ];
                const toSelect = formKeys.filter(([, v]) => v !== undefined).map(([k]) => k);
                if (toSelect.length > 0) {
                    const field = listOrWeb.fields.getById(fieldInfo.Id);
                    const formActual = (await (field as typeof field & PnPSelectable).select(
                        ...toSelect
                    )()) as Record<string, unknown>;
                    for (const [k, v] of formKeys) {
                        if (v === undefined) continue;
                        if ((formActual[k] ?? null) !== (v ?? null)) {
                            visibilityMismatches.push({ key: k, expected: v, actual: formActual[k] });
                        }
                    }
                }

                if (visibilityMismatches.length > 0) {
                    // addToDefaultView mismatch is best-effort; form visibility mismatch is strict.
                    const strict = visibilityMismatches.filter((m) => m.key !== "addToDefaultView");
                    if (strict.length > 0) {
                        return { outcome: "non_compliant", resource, reason: "visibility_mismatch", details: { visibilityMismatches } };
                    }
                    return { outcome: "unverifiable", resource, reason: "best_effort_mismatch", details: { visibilityMismatches } };
                }
            }

            return { outcome: "compliant", resource };
        } catch (e) {
            return {
                outcome: "unverifiable",
                resource,
                reason: "error",
                message: normalizeError(e).message,
            };
        }
    }
}
