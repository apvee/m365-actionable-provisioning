/**
 * CreateSPSiteColumn action definition.
 *
 * @remarks
 * Creates a SharePoint site column (field at the web level).
 * This action aligns with SharePoint's `createSiteColumn` verb in site scripts
 * (with `SP` prefix for library consistency).
 *
 * Uses the shared handler from `field-handler.ts` for DRY architecture.
 *
 * @packageDocumentation
 */

import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { M365Clients, ProvisioningResultLight, M365Scope, M365RuntimeContext, M365ActionResult } from "../../../../runtime";

import { createSPSiteColumnSchema, type CreateSPSiteColumnPayload } from "./schema";
import { handleFieldCreation, checkFieldCompliance } from "../_shared/field-handler";

/* ========================================
   ACTION DEFINITION
   ======================================== */

/**
 * Action definition for creating SharePoint site columns.
 *
 * @remarks
 * Aligns with SharePoint site script verb `createSiteColumn`.
 * Use this action when creating site columns within site subactions.
 *
 * @public
 */
export class CreateSPSiteColumnAction extends ActionDefinition<
    "createSPSiteColumn",
    typeof createSPSiteColumnSchema,
    M365Scope,
    ProvisioningResultLight,
    M365Clients
> {
    readonly verb = "createSPSiteColumn";
    readonly actionSchema = createSPSiteColumnSchema;
    readonly requiredClients = ["spfi"] as const;

    async handler(ctx: M365RuntimeContext<CreateSPSiteColumnPayload>): Promise<M365ActionResult> {
        return handleFieldCreation({
            def: ctx.action.payload,
            scopeIn: ctx.scopeIn,
            logger: ctx.logger,
        });
    }

    async checkCompliance(
        ctx: ComplianceRuntimeContext<M365Scope, CreateSPSiteColumnPayload, M365Clients>
    ): Promise<ComplianceActionCheckResult<M365Scope>> {
        return checkFieldCompliance(ctx);
    }
}
