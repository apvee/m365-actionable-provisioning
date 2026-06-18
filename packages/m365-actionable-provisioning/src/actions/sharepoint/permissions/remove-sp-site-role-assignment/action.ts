import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionSkipped, unverifiable } from "../../_shared/action-results";

import { removeSPSiteRoleAssignmentSchema, type RemoveSPSiteRoleAssignmentPayload } from "./schema";

export class RemoveSPSiteRoleAssignmentAction extends ActionDefinition<
  "removeSPSiteRoleAssignment",
  typeof removeSPSiteRoleAssignmentSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "removeSPSiteRoleAssignment";
  readonly actionSchema = removeSPSiteRoleAssignmentSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return { decision: "unknown", message: "SharePoint permission runtime is introduced in Task 4" };
  }

  async handler(ctx: M365RuntimeContext<RemoveSPSiteRoleAssignmentPayload>): Promise<M365ActionResult> {
    const resource = (ctx.action.payload as { principal?: string }).principal ?? ctx.action.verb;
    return actionSkipped(resource, "unsupported");
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, RemoveSPSiteRoleAssignmentPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const resource = (ctx.action.payload as { principal?: string }).principal ?? ctx.action.verb;
    return unverifiable({
      resource,
      reason: "not_supported",
      message: "SharePoint permission runtime is introduced in Task 4",
    });
  }
}
