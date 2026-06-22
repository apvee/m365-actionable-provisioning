import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import { getNavigationCollection, getNavigationNodeInfoByTitle } from "../../domains/navigation";
import { buildAmbiguousNavigationNodeWarning, buildNavigationScopeDelta, checkNavigationManageWebPermission, getNavigationCompliancePrerequisites } from "../_shared/scope";
import { deleteSPNavigationNodeSchema, type DeleteSPNavigationNodePayload } from "./schema";
import "@pnp/sp/navigation";

export class DeleteSPNavigationNodeAction extends ActionDefinition<
  "deleteSPNavigationNode",
  typeof deleteSPNavigationNodeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "deleteSPNavigationNode";
  readonly actionSchema = deleteSPNavigationNodeSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<DeleteSPNavigationNodePayload>): Promise<PermissionCheckResult> {
    return checkNavigationManageWebPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<DeleteSPNavigationNodePayload>): Promise<M365ActionResult> {
    const web = ctx.scopeIn.web;
    const payload = ctx.action.payload;
    if (!web) return actionSkipped(payload.title, "missing_prerequisite");

    const existing = await getNavigationNodeInfoByTitle(web, payload.location, payload.title);
    if (existing.kind === "missing") return actionSkipped(payload.title, "not_found", buildNavigationScopeDelta(ctx.scopeIn));
    if (existing.kind === "ambiguous") {
      return actionSkipped(
        payload.title,
        "unsupported",
        buildNavigationScopeDelta(ctx.scopeIn),
        [buildAmbiguousNavigationNodeWarning(payload.location, payload.title, existing.matches.length)]
      );
    }

    await getNavigationCollection(web, payload.location).getById(existing.node.Id).delete();
    return actionExecuted(payload.title, buildNavigationScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, DeleteSPNavigationNodePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const payload = ctx.action.payload;
    const prerequisites = getNavigationCompliancePrerequisites(ctx, payload.title);
    if (prerequisites.ok === false) return prerequisites.result;

    try {
      const existing = await getNavigationNodeInfoByTitle(prerequisites.web, payload.location, payload.title);
      if (existing.kind === "missing") return compliant({ resource: payload.title });
      return nonCompliant({ resource: payload.title, reason: existing.kind === "ambiguous" ? "ambiguous" : "exists" });
    } catch (error) {
      return unverifiableError(payload.title, error);
    }
  }
}
