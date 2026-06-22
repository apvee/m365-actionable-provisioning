/**
 * AddSPField action definition.
 *
 * @remarks
 * Creates a SharePoint field within a list context.
 * This action aligns with SharePoint's `addSPField` verb in site scripts.
 *
 * Uses the shared handler from `field-handler.ts` for DRY architecture.
 *
 * @packageDocumentation
 */

import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { M365Clients, ProvisioningResultLight, M365Scope, M365RuntimeContext, M365ActionResult } from "../../../../runtime";

import { addSPFieldSchema, type AddSPFieldPayload } from "./schema";
import { handleFieldCreation, checkFieldCompliance } from "../_shared/field-handler";

/* ========================================
   ACTION DEFINITION
   ======================================== */

/**
 * Action definition for adding SharePoint fields to lists.
 *
 * @remarks
 * Aligns with SharePoint site script verb `addSPField`.
 * Use this action when creating fields within list subactions.
 *
 * @public
 */
export class AddSPFieldAction extends ActionDefinition<
    "addSPField",
    typeof addSPFieldSchema,
    M365Scope,
    ProvisioningResultLight,
    M365Clients
> {
    readonly verb = "addSPField";
    readonly actionSchema = addSPFieldSchema;
    readonly requiredClients = ["spfi"] as const;

    async handler(ctx: M365RuntimeContext<AddSPFieldPayload>): Promise<M365ActionResult> {
        return handleFieldCreation({
            def: ctx.action.payload,
            scopeIn: ctx.scopeIn,
            logger: ctx.logger,
        });
    }

    async checkCompliance(
        ctx: ComplianceRuntimeContext<M365Scope, AddSPFieldPayload, M365Clients>
    ): Promise<ComplianceActionCheckResult<M365Scope>> {
        return checkFieldCompliance(ctx);
    }
}
