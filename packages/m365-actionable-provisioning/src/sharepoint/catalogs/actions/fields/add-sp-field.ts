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
import type { SPScope, SPRuntimeContext, SPActionResult } from "../../../types";

import { addSPFieldSchema, type AddSPFieldPayload } from "../../schemas/fields/add-sp-field.schema";
import { handleFieldCreation, checkFieldCompliance } from "./field-handler";

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
    SPScope
> {
    readonly verb = "addSPField";
    readonly actionSchema = addSPFieldSchema;

    override async handler(ctx: SPRuntimeContext<AddSPFieldPayload>): Promise<SPActionResult> {
        return handleFieldCreation({
            def: ctx.action.payload,
            scopeIn: ctx.scopeIn,
            logger: ctx.logger,
        });
    }

    override async checkCompliance(
        ctx: ComplianceRuntimeContext<SPScope, AddSPFieldPayload>
    ): Promise<ComplianceActionCheckResult<SPScope>> {
        return checkFieldCompliance(ctx);
    }
}

