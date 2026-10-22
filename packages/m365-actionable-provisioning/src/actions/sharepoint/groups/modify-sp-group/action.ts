import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import { buildSPGroupUpdateProps, getSPGroupMismatches, resolveSPGroup } from "../../domains/groups";
import { checkSPGroupPermissions, getSPGroupCompliancePrerequisites, getSPGroupResource } from "../_shared/scope";
import { modifySPGroupSchema, type ModifySPGroupPayload } from "./schema";
import "@pnp/sp/site-groups/web";

/** Enforces declared group properties using the original name or stable numeric ID. */
export class ModifySPGroupAction extends ActionDefinition<
  "modifySPGroup", typeof modifySPGroupSchema, M365Scope, ProvisioningResultLight, M365Clients
> {
  readonly verb = "modifySPGroup";
  readonly actionSchema = modifySPGroupSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<ModifySPGroupPayload>): Promise<PermissionCheckResult> {
    return checkSPGroupPermissions(ctx, "modify");
  }

  async handler(ctx: M365RuntimeContext<ModifySPGroupPayload>): Promise<M365ActionResult> {
    const payload = ctx.action.payload;
    const resource = getSPGroupResource(payload);
    const web = ctx.scopeIn.web;
    if (!web) return actionSkipped(resource, "missing_prerequisite");
    const existing = await resolveSPGroup(web, payload);
    if (!existing) return actionSkipped(resource, "not_found");
    if (getSPGroupMismatches(payload, existing).length === 0) return actionSkipped(resource, "no_changes");
    await web.siteGroups.getById(existing.Id).update(buildSPGroupUpdateProps(payload));
    return actionExecuted(resource);
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, ModifySPGroupPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const payload = ctx.action.payload;
    const resource = getSPGroupResource(payload);
    const prerequisites = getSPGroupCompliancePrerequisites(ctx, resource);
    if (prerequisites.ok === false) return prerequisites.result;
    try {
      const existing = await resolveSPGroup(prerequisites.web, payload);
      if (!existing) return nonCompliant({ resource, reason: "not_found" });
      const mismatches = getSPGroupMismatches(payload, existing);
      return mismatches.length === 0
        ? compliant({ resource })
        : nonCompliant({ resource, reason: "drift", details: { mismatches } });
    } catch (error) {
      return unverifiableError(resource, error);
    }
  }
}
