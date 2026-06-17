/**
 * Shared field creation handler.
 *
 * @remarks
 * This module contains the core field creation logic shared by both
 * `addSPField` (list context) and `createSPSiteColumn` (site context) actions.
 *
 * The DRY architecture ensures that field creation logic is written once and
 * reused by both action wrappers.
 *
 * @packageDocumentation
 */

import type { BaseFieldPayload } from "./field-base-schema";
import type { M365Scope, M365ActionResult, ProvisioningWarning } from "../../../../runtime";
import type { ActionRuntimeContext } from "../../../../core/action";
import { pickDefined } from "../../utils/object-utils";

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
    extractFieldId,
    getFieldStructuralInfoByNameOrTitle,
    updateFieldDisplayName,
} from "../../domains/fields/field-lookup";
import { checkFieldStructuralCompatibility } from "../../domains/fields/field-structural-compatibility";

import { normalizeError } from "../../../../core";
import type { ComplianceActionCheckResult, ComplianceRuntimeContext } from "../../../../core/action";

/* ========================================
   FIELD HANDLER CONTEXT
   ======================================== */

/**
 * Context for field creation handler.
 */
export interface FieldHandlerContext {
    /** The field definition payload (without verb) */
    def: BaseFieldPayload;
    /** The scope containing web and optionally list */
    scopeIn: M365Scope;
    /** Logger for status messages */
    logger: ActionRuntimeContext<M365Scope, BaseFieldPayload>["logger"];
}

/* ========================================
   SHARED FIELD CREATION HANDLER
   ======================================== */

/**
 * Shared handler for creating SharePoint fields.
 *
 * @remarks
 * Used by both `AddSPFieldAction` and `CreateSPSiteColumnAction`.
 * The target container (list or web) is determined by the scope.
 *
 * @param ctx - The field handler context
 * @returns The action result
 */
export async function handleFieldCreation(ctx: FieldHandlerContext): Promise<M365ActionResult> {
    const { def, scopeIn, logger } = ctx;
    const resource = def.fieldName;
    const warnings: ProvisioningWarning[] = [];

    const addWarning = (
        code: string,
        message: string,
        details?: Record<string, string | number | boolean | null>
    ): void => {
        const warning: ProvisioningWarning = details ? { code, message, details } : { code, message };
        warnings.push(warning);
        logger.warn(message, {
            code,
            fieldName: def.fieldName,
            fieldType: def.fieldType,
            ...(details ?? {}),
        });
    };

    const list = scopeIn.list;
    const web = scopeIn.web;
    const container = list ?? web;

    if (!container) {
        return {
            result: {
                outcome: "skipped",
                resource,
                reason: "missing_prerequisite",
            },
        };
    }

    // Step 1: idempotency check
    const existingField = await getFieldStructuralInfoByNameOrTitle(container, def.fieldName);
    if (existingField) {
        const compatibility = checkFieldStructuralCompatibility(def.fieldType, existingField);
        const structuralWarnings: ProvisioningWarning[] = [];

        if ("reason" in compatibility) {
            const isUnverifiable = compatibility.reason === "field_type_unverifiable";
            structuralWarnings.push({
                code: isUnverifiable ? "FIELD_STRUCTURAL_UNVERIFIABLE" : "FIELD_STRUCTURAL_COLLISION",
                message: isUnverifiable
                    ? "Field already exists, but its SharePoint field type could not be verified."
                    : "Field already exists with a structural type that does not match the create action payload.",
                details: {
                    fieldName: def.fieldName,
                    expectedFieldType: def.fieldType,
                    actualTypeAsString: compatibility.actualTypeAsString ?? null,
                    reason: compatibility.reason,
                },
            });

            logger.warn("Field structural compatibility issue detected while skipping create", {
                fieldName: def.fieldName,
                expectedFieldType: def.fieldType,
                actualTypeAsString: compatibility.actualTypeAsString,
                reason: compatibility.reason,
            });
        }

        logger.info("Field already exists - skipping creation", {
            container: list ? "list" : "web",
            fieldName: def.fieldName,
        });

        return {
            result: {
                outcome: "skipped",
                resource,
                reason: "already_exists",
                ...(structuralWarnings.length > 0 ? { warnings: structuralWarnings } : {}),
            },
        };
    }

    type FieldAddResult = { Id?: string; data?: { Id?: string } };
    const fieldsApi = container.fields as typeof container.fields & {
        addMultilineText: (fieldName: string, props: Record<string, unknown>) => Promise<FieldAddResult>;
        addChoice: (fieldName: string, props: Record<string, unknown>) => Promise<FieldAddResult>;
        addMultiChoice: (fieldName: string, props: Record<string, unknown>) => Promise<FieldAddResult>;
        addUser: (fieldName: string, props: Record<string, unknown>) => Promise<FieldAddResult>;
        addCalculated: (fieldName: string, props: Record<string, unknown>) => Promise<FieldAddResult>;
        addLocation: (fieldName: string, props: Record<string, unknown>) => Promise<FieldAddResult>;
        addImageField: (fieldName: string, props: Record<string, unknown>) => Promise<FieldAddResult>;
    };

    let createResult: FieldAddResult;

    switch (def.fieldType) {
        case "Text": {
            const createProps = pickDefined({
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
                Id: def.id,
            });

            createResult = await container.fields.addText(def.fieldName, createProps);
            break;
        }

        case "MultilineText": {
            // NOTE: DO NOT pass Required on create (PnPjs limitation), apply it after creation.
            const createProps = pickDefined({
                NumberOfLines: def.numberOfLines,
                RichText: def.richText,
                RestrictedMode: def.restrictedMode,
                AppendOnly: def.appendOnly,
                AllowHyperlink: def.allowHyperlink,
                Group: def.group,
                Description: def.description,
                Hidden: def.hidden,
                DefaultValue: def.defaultValue,
                Id: def.id,
            });

            createResult = await fieldsApi.addMultilineText(def.fieldName, createProps as Record<string, unknown>);
            break;
        }

        case "Number": {
            const createProps = pickDefined({
                MinimumValue: def.minimumValue,
                MaximumValue: def.maximumValue,
                ShowAsPercentage: def.showAsPercentage,
                // SharePoint expects DefaultValue as Edm.String even for numeric fields
                DefaultValue: def.defaultValue !== undefined ? String(def.defaultValue) : undefined,
                Group: def.group,
                Required: def.required,
                Description: def.description,
                Hidden: def.hidden,
                EnforceUniqueValues: def.enforceUniqueValues,
                Indexed: def.indexed,
                ValidationFormula: def.validationFormula,
                ValidationMessage: def.validationMessage,
                Id: def.id,
            });

            createResult = await container.fields.addNumber(def.fieldName, createProps);
            break;
        }

        case "Currency": {
            const createProps = pickDefined({
                MinimumValue: def.minimumValue,
                MaximumValue: def.maximumValue,
                CurrencyLocaleId: def.currencyLocaleId,
                // SharePoint expects DefaultValue as Edm.String even for numeric fields
                DefaultValue: def.defaultValue !== undefined ? String(def.defaultValue) : undefined,
                Group: def.group,
                Required: def.required,
                Description: def.description,
                Hidden: def.hidden,
                EnforceUniqueValues: def.enforceUniqueValues,
                Indexed: def.indexed,
                ValidationFormula: def.validationFormula,
                ValidationMessage: def.validationMessage,
                Id: def.id,
            });

            createResult = await container.fields.addCurrency(def.fieldName, createProps);
            break;
        }

        case "Boolean": {
            const createProps = pickDefined({
                DefaultValue:
                    def.defaultValue !== undefined ? (def.defaultValue ? "1" : "0") : undefined,
                Group: def.group,
                Required: def.required,
                Description: def.description,
                Hidden: def.hidden,
                Id: def.id,
            });

            createResult = await container.fields.addBoolean(def.fieldName, createProps);
            break;
        }

        case "Choice": {
            const createProps = pickDefined({
                Choices: def.choices,
                EditFormat:
                    def.editFormat !== undefined
                        ? ChoiceFieldFormatType[def.editFormat]
                        : ChoiceFieldFormatType.Dropdown,
                FillInChoice: def.fillInChoice,
                DefaultValue: def.defaultChoice,
                Group: def.group,
                Required: def.required,
                Description: def.description,
                Hidden: def.hidden,
                EnforceUniqueValues: def.enforceUniqueValues,
                Indexed: def.indexed,
                ValidationFormula: def.validationFormula,
                ValidationMessage: def.validationMessage,
                Id: def.id,
            });

            createResult = await fieldsApi.addChoice(def.fieldName, createProps as Record<string, unknown>);
            break;
        }

        case "MultiChoice": {
            const createProps = pickDefined({
                Choices: def.choices,
                FillInChoice: def.fillInChoice,
                DefaultValue:
                    def.defaultValue !== undefined && def.defaultValue.length > 0
                        ? def.defaultValue.join(";#")
                        : undefined,
                Group: def.group,
                Required: def.required,
                Description: def.description,
                Hidden: def.hidden,
                EnforceUniqueValues: def.enforceUniqueValues,
                Indexed: def.indexed,
                ValidationFormula: def.validationFormula,
                ValidationMessage: def.validationMessage,
                Id: def.id,
            });

            createResult = await fieldsApi.addMultiChoice(def.fieldName, createProps as Record<string, unknown>);
            break;
        }

        case "User": {
            const createProps = pickDefined({
                SelectionMode:
                    def.selectionMode !== undefined
                        ? FieldUserSelectionMode[def.selectionMode]
                        : undefined,

                Group: def.group,
                Required: def.required,
                Description: def.description,
                Hidden: def.hidden,
                EnforceUniqueValues: def.enforceUniqueValues,
                Indexed: def.indexed,
                ValidationFormula: def.validationFormula,
                ValidationMessage: def.validationMessage,
                Id: def.id,
            });

            createResult = await fieldsApi.addUser(def.fieldName, createProps as Record<string, unknown>);
            break;
        }

        case "Lookup": {
            // Resolve lookup list id (either provided or by title)
            let lookupListId: string;
            if (def.lookupListId) {
                lookupListId = def.lookupListId;
            } else if (def.lookupListName) {
                if (!web) {
                    throw new Error(
                        "lookupListName requires a web in scope. Use lookupListId or execute under a site/list action that provides scopeIn.web."
                    );
                }

                // IMPORTANT: match OLD semantics - lookupListName refers to RootFolder/Name (list 'root name'), not Title.
                const escapedName = def.lookupListName.replace(/'/g, "''");
                const matches = await web.lists
                    .expand("RootFolder")
                    .select("Id", "RootFolder/Name")
                    .filter(`RootFolder/Name eq '${escapedName}'`)();

                if (!matches || matches.length === 0) {
                    throw new Error(
                        `Lookup list '${def.lookupListName}' not found (expected match on RootFolder/Name).`
                    );
                }

                lookupListId = (matches[0] as { Id: string }).Id;
            } else {
                throw new Error("Either lookupListId or lookupListName must be provided for Lookup fields");
            }

            const createProps = pickDefined({
                LookupListId: lookupListId,
                LookupWebId: def.lookupWebId,
                LookupFieldName: def.showField ?? "Title",
            });

            createResult = await container.fields.addLookup(def.fieldName, createProps);
            break;
        }

        case "Url": {
            const createProps = pickDefined({
                DisplayFormat:
                    def.displayFormat !== undefined ? UrlFieldFormatType[def.displayFormat] : undefined,
                Group: def.group,
                Required: def.required,
                Description: def.description,
                Hidden: def.hidden,
                DefaultValue: def.defaultValue,
                EnforceUniqueValues: def.enforceUniqueValues,
                Indexed: def.indexed,
                ValidationFormula: def.validationFormula,
                ValidationMessage: def.validationMessage,
                Id: def.id,
            });

            createResult = await container.fields.addUrl(def.fieldName, createProps);
            break;
        }

        case "Calculated": {
            const createProps = pickDefined({
                Formula: def.formula,
                OutputType: def.outputType !== undefined ? FieldTypes[def.outputType] : undefined,
                DateFormat: def.dateFormat !== undefined ? DateTimeFieldFormatType[def.dateFormat] : undefined,
                Group: def.group,
                Required: def.required,
                Description: def.description,
                Hidden: def.hidden,
                EnforceUniqueValues: def.enforceUniqueValues,
                Indexed: def.indexed,
                ValidationFormula: def.validationFormula,
                ValidationMessage: def.validationMessage,
                Id: def.id,
            });

            createResult = await fieldsApi.addCalculated(def.fieldName, createProps as Record<string, unknown>);
            break;
        }

        case "Location": {
            const createProps = pickDefined({
                Group: def.group,
                Required: def.required,
                Description: def.description,
                Hidden: def.hidden,
                EnforceUniqueValues: def.enforceUniqueValues,
                Indexed: def.indexed,
                ValidationFormula: def.validationFormula,
                ValidationMessage: def.validationMessage,
                Id: def.id,
            });

            createResult = await fieldsApi.addLocation(def.fieldName, createProps as Record<string, unknown>);
            break;
        }

        case "Image": {
            const createProps = pickDefined({
                Group: def.group,
                Required: def.required,
                Description: def.description,
                Hidden: def.hidden,
                EnforceUniqueValues: def.enforceUniqueValues,
                Indexed: def.indexed,
                ValidationFormula: def.validationFormula,
                ValidationMessage: def.validationMessage,
                Id: def.id,
            });

            createResult = await fieldsApi.addImageField(def.fieldName, createProps as Record<string, unknown>);
            break;
        }

        case "DateTime": {
            const createProps = pickDefined({
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

                Group: def.group,
                Required: def.required,
                Description: def.description,
                Hidden: def.hidden,
                DefaultValue: def.defaultValue,
                EnforceUniqueValues: def.enforceUniqueValues,
                Indexed: def.indexed,
                ValidationFormula: def.validationFormula,
                ValidationMessage: def.validationMessage,
                Id: def.id,
            });

            createResult = await container.fields.addDateTime(def.fieldName, createProps);
            break;
        }

        default: {
            // Exhaustive guard
            const _exhaustive: never = def;
            throw new Error(`Unsupported fieldType: ${(_exhaustive as BaseFieldPayload).fieldType}`);
        }
    }

    // Step 3: extract field id (fallback to lookup)
    let fieldId = extractFieldId(createResult);
    if (!fieldId) {
        const createdField = await container.fields.getByInternalNameOrTitle(def.fieldName)();
        fieldId = createdField.Id;
    }


    // Step 4: update display name if needed
    if (def.displayName !== def.fieldName) {
        await updateFieldDisplayName(container, def.fieldName, def.displayName);
    }

    // MultilineText quirk: apply Required post-create
    if (def.fieldType === "MultilineText" && def.required !== undefined) {
        try {
            await container.fields.getById(fieldId).update({ Required: def.required });
        } catch (e) {
            addWarning(
                "FIELD_BEST_EFFORT_REQUIRED_FAILED",
                "Field was created, but Required could not be applied as a best-effort post-create update.",
                { error: normalizeError(e).message }
            );
        }
    }

    // User quirk: AllowMultipleValues/Presence/SelectionGroup aren't supported on create via PnPjs typings
    // so we apply them post-create as a best-effort SP.FieldUser update.
    if (
        def.fieldType === "User" &&
        (def.allowMultipleValues !== undefined ||
            def.presence !== undefined ||
            def.selectionGroup !== undefined)
    ) {
        try {
            await container.fields.getById(fieldId).update(
                pickDefined({
                    AllowMultipleValues: def.allowMultipleValues,
                    Presence: def.presence,
                    SelectionGroup: def.selectionGroup,
                }),
                "SP.FieldUser"
            );
        } catch (e) {
            addWarning(
                "FIELD_BEST_EFFORT_USER_SETTINGS_FAILED",
                "Field was created, but one or more user field settings could not be applied as best-effort post-create updates.",
                { error: normalizeError(e).message }
            );
        }
    }

    // Lookup quirk: addLookup only supports lookup target properties; apply the rest post-create.
    if (def.fieldType === "Lookup") {
        const relationshipDeleteBehaviorValue =
            def.relationshipDeleteBehavior === "Cascade"
                ? 1
                : def.relationshipDeleteBehavior === "Restrict"
                    ? 2
                    : def.relationshipDeleteBehavior === "None"
                        ? 0
                        : undefined;

        const hasLookupPostProps =
            def.group !== undefined ||
            def.required !== undefined ||
            def.description !== undefined ||
            def.hidden !== undefined ||
            def.enforceUniqueValues !== undefined ||
            def.indexed !== undefined ||
            def.validationFormula !== undefined ||
            def.validationMessage !== undefined ||
            def.allowMultipleValues !== undefined ||
            relationshipDeleteBehaviorValue !== undefined;

        if (hasLookupPostProps) {
            try {
                await container.fields.getById(fieldId).update(
                    pickDefined({
                        Group: def.group,
                        Required: def.required,
                        Description: def.description,
                        Hidden: def.hidden,
                        EnforceUniqueValues: def.enforceUniqueValues,
                        Indexed: def.indexed,
                        ValidationFormula: def.validationFormula,
                        ValidationMessage: def.validationMessage,
                        AllowMultipleValues: def.allowMultipleValues,
                        RelationshipDeleteBehavior: relationshipDeleteBehaviorValue,
                    }),
                    "SP.FieldLookup"
                );
            } catch (e) {
                addWarning(
                    "FIELD_BEST_EFFORT_LOOKUP_SETTINGS_FAILED",
                    "Field was created, but one or more lookup field settings could not be applied as best-effort post-create updates.",
                    { error: normalizeError(e).message }
                );
            }
        }

        // Optional dependent lookup fields (best-effort)
        if (def.dependentLookupFields && def.dependentLookupFields.length > 0) {
            for (const showField of def.dependentLookupFields) {
                try {
                    await container.fields.addDependentLookupField(
                        `${def.fieldName}_${showField}`,
                        fieldId,
                        showField
                    );
                } catch (e) {
                    addWarning(
                        "FIELD_BEST_EFFORT_DEPENDENT_LOOKUP_FAILED",
                        "Field was created, but a dependent lookup field could not be added.",
                        { showField, error: normalizeError(e).message }
                    );
                }
            }
        }
    }

    // Step 5: apply view/form settings (only for list context)
    if (list && "addToDefaultView" in def) {
        await applyFieldViewSettings(list, def.fieldName, {
            addToDefaultView: def.addToDefaultView,
            showInDisplayForm: def.showInDisplayForm,
            showInEditForm: def.showInEditForm,
            showInNewForm: def.showInNewForm,
        }, {
            onBestEffortFailure: ({ code, message, error }) => {
                addWarning(code, message, { error: normalizeError(error).message });
            },
        });
    }

    logger.info("Field created", {
        container: list ? "list" : "web",
        fieldId,
        fieldName: def.fieldName,
        displayName: def.displayName,
        fieldType: def.fieldType,
    });

    return {
        result: {
            outcome: "executed",
            resource,
            ...(warnings.length > 0 ? { warnings } : {}),
        },
    };
}

/* ========================================
   SHARED COMPLIANCE CHECK HANDLER
   ======================================== */

/**
 * Shared compliance check for field existence.
 *
 * @param ctx - The compliance runtime context
 * @returns The compliance check result
 */
export async function checkFieldCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, BaseFieldPayload>
): Promise<ComplianceActionCheckResult<M365Scope>> {
    const def = ctx.action.payload;
    const resource = def.fieldName;

    const list = ctx.scopeIn.list;
    const web = ctx.scopeIn.web;
    const container = list ?? web;

    if (!container) {
        return { outcome: "unverifiable", resource, reason: "missing_prerequisite" };
    }

    try {
        const fieldInfo = await getFieldStructuralInfoByNameOrTitle(container, def.fieldName);
        if (!fieldInfo) {
            return { outcome: "non_compliant", resource, reason: "not_found" };
        }

        const compatibility = checkFieldStructuralCompatibility(def.fieldType, fieldInfo);
        if ("reason" in compatibility) {
            return {
                outcome: compatibility.reason === "field_type_unverifiable" ? "unverifiable" : "non_compliant",
                resource,
                reason: compatibility.reason,
                message:
                    compatibility.reason === "field_type_unverifiable"
                        ? "Field exists, but its SharePoint field type could not be verified."
                        : "Field exists, but its SharePoint field type does not match the create action payload.",
                details: {
                    expectedFieldType: def.fieldType,
                    actualTypeAsString: compatibility.actualTypeAsString,
                },
            };
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
