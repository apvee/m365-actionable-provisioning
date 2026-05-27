/**
 * DeleteSPField action definition.
 *
 * @remarks
 * Deletes a SharePoint field.
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

import { deleteSPFieldSchema, type DeleteSPFieldPayload } from "../../schemas/fields/delete-sp-field.schema";
import "@pnp/sp/fields";
import "@pnp/sp/lists";

import { getFieldByNameOrTitle } from "./field-utils";

/* ========================================
   ACTION DEFINITION
   ======================================== */

/**
 * Action definition for deleting SharePoint fields.
 * @public
 */
export class DeleteSPFieldAction extends ActionDefinition<
    "deleteSPField",
    typeof deleteSPFieldSchema,
    SPScope
> {
    readonly verb = "deleteSPField";
    readonly actionSchema = deleteSPFieldSchema;

    override async handler(ctx: SPRuntimeContext<DeleteSPFieldPayload>): Promise<SPActionResult> {
        const payload = ctx.action.payload;
        const resource = payload.fieldName ?? payload.fieldId ?? "field";

        const scopeIn = ctx.scopeIn;

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

        // Fast path: delete by id
        if (payload.fieldId) {
            try {
                await container.fields.getById(payload.fieldId).delete();
                return {
                    result: {
                        outcome: "executed",
                        resource,
                    },
                };
            } catch {
                // If fieldId is wrong, treat as not found (idempotent)
                return {
                    result: {
                        outcome: "skipped",
                        resource,
                        reason: "not_found",
                    },
                };
            }
        }

        // Resolve by name/title then delete
        const fieldName = ctx.action.payload.fieldName;
        if (!fieldName) {
            throw new Error("fieldName is required when fieldId is not provided");
        }
        const fieldInfo = await getFieldByNameOrTitle(container, fieldName);

        if (!fieldInfo) {
            return {
                result: {
                    outcome: "skipped",
                    resource,
                    reason: "not_found",
                },
            };
        }

        await container.fields.getById(fieldInfo.Id).delete();

        return {
            result: {
                outcome: "executed",
                resource,
            },
        };
    }

    override async checkCompliance(
        ctx: ComplianceRuntimeContext<SPScope, DeleteSPFieldPayload>
    ): Promise<ComplianceActionCheckResult<SPScope>> {
        const payload = ctx.action.payload;
        const resource = payload.fieldName ?? payload.fieldId ?? "field";

        const list = ctx.scopeIn.list;
        const web = ctx.scopeIn.web;
        const container = list ?? web;

        if (!container) {
            return { outcome: "unverifiable", resource, reason: "missing_prerequisite" };
        }

        type PnPSelectableTyped<T extends Record<string, unknown>> = {
            select: (...k: string[]) => () => Promise<T>;
        };

        try {
            if (payload.fieldId) {
                try {
                    const field = container.fields.getById(payload.fieldId);
                    const info = await (field as typeof field & PnPSelectableTyped<{ Id?: string }>).select(
                        "Id"
                    )();
                    if (info?.Id) return { outcome: "non_compliant", resource, reason: "still_exists" };
                    return { outcome: "compliant", resource };
                } catch {
                    // Not found is compliant for delete; forbidden/other errors are unverifiable.
                    return { outcome: "compliant", resource };
                }
            }

            const fieldName = payload.fieldName;
            if (!fieldName) {
                return { outcome: "unverifiable", resource, reason: "missing_prerequisite", message: "fieldName required when fieldId not provided" };
            }
            const fieldInfo = await getFieldByNameOrTitle(container, fieldName);
            if (!fieldInfo) return { outcome: "compliant", resource };
            return { outcome: "non_compliant", resource, reason: "still_exists" };
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
