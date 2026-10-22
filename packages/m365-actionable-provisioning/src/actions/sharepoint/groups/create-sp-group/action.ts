import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import { buildSPGroupUpdateProps, resolveSPGroup } from "../../domains/groups";
import { checkSPGroupPermissions, getSPGroupCompliancePrerequisites } from "../_shared/scope";
import { createSPGroupSchema, type CreateSPGroupPayload } from "./schema";
import "@pnp/sp/site-groups/web";

/** Ensures a SharePoint site collection group exists, without reconciling existing properties. */
export class CreateSPGroupAction extends ActionDefinition<
  "createSPGroup", typeof createSPGroupSchema, M365Scope, ProvisioningResultLight, M365Clients
> {
  readonly verb = "createSPGroup";
  readonly actionSchema = createSPGroupSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<CreateSPGroupPayload>): Promise<PermissionCheckResult> {
    return checkSPGroupPermissions(ctx, "create");
  }

  async handler(ctx: M365RuntimeContext<CreateSPGroupPayload>): Promise<M365ActionResult> {
    const { title } = ctx.action.payload;
    const web = ctx.scopeIn.web;
    if (!web) return actionSkipped(title, "missing_prerequisite");
    if (await resolveSPGroup(web, { groupName: title })) return actionSkipped(title, "already_exists");
    await web.siteGroups.add(buildSPGroupUpdateProps(ctx.action.payload));
    return actionExecuted(title);
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, CreateSPGroupPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const resource = ctx.action.payload.title;
    const prerequisites = getSPGroupCompliancePrerequisites(ctx, resource);
    if (prerequisites.ok === false) return prerequisites.result;
    try {
      return await resolveSPGroup(prerequisites.web, { groupName: resource })
        ? compliant({ resource })
        : nonCompliant({ resource, reason: "not_found" });
    } catch (error) {
      return unverifiableError(resource, error);
    }
  }
}
