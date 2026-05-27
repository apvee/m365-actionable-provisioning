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
import type { SPScope, SPRuntimeContext, SPActionResult } from "../../../types";

import { createSPSiteColumnSchema, type CreateSPSiteColumnPayload } from "../../schemas/fields/create-sp-site-column.schema";
import { handleFieldCreation, checkFieldCompliance } from "./field-handler";

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
    SPScope
> {
    readonly verb = "createSPSiteColumn";
    readonly actionSchema = createSPSiteColumnSchema;

    override async handler(ctx: SPRuntimeContext<CreateSPSiteColumnPayload>): Promise<SPActionResult> {
        return handleFieldCreation({
            def: ctx.action.payload,
            scopeIn: ctx.scopeIn,
            logger: ctx.logger,
        });
    }

    override async checkCompliance(
        ctx: ComplianceRuntimeContext<SPScope, CreateSPSiteColumnPayload>
    ): Promise<ComplianceActionCheckResult<SPScope>> {
        return checkFieldCompliance(ctx);
    }
}

