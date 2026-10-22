import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import { resolveSPGroup } from "../../domains/groups";
import { checkSPGroupPermissions, getSPGroupCompliancePrerequisites, getSPGroupResource } from "../_shared/scope";
import { deleteSPGroupSchema, type DeleteSPGroupPayload } from "./schema";
import "@pnp/sp/site-groups/web";

/** Removes the referenced group from the site collection, if present. */
export class DeleteSPGroupAction extends ActionDefinition<
  "deleteSPGroup", typeof deleteSPGroupSchema, M365Scope, ProvisioningResultLight, M365Clients
> {
  readonly verb = "deleteSPGroup";
  readonly actionSchema = deleteSPGroupSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<DeleteSPGroupPayload>): Promise<PermissionCheckResult> {
    return checkSPGroupPermissions(ctx, "delete");
  }

  async handler(ctx: M365RuntimeContext<DeleteSPGroupPayload>): Promise<M365ActionResult> {
    const payload = ctx.action.payload;
    const resource = getSPGroupResource(payload);
    const web = ctx.scopeIn.web;
    if (!web) return actionSkipped(resource, "missing_prerequisite");
    const existing = await resolveSPGroup(web, payload);
    if (!existing) return actionSkipped(resource, "not_found");
    await web.siteGroups.removeById(existing.Id);
    return actionExecuted(resource);
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, DeleteSPGroupPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const resource = getSPGroupResource(ctx.action.payload);
    const prerequisites = getSPGroupCompliancePrerequisites(ctx, resource);
    if (prerequisites.ok === false) return prerequisites.result;
    try {
      return await resolveSPGroup(prerequisites.web, ctx.action.payload)
        ? nonCompliant({ resource, reason: "exists" })
        : compliant({ resource });
    } catch (error) {
      return unverifiableError(resource, error);
    }
  }
}
