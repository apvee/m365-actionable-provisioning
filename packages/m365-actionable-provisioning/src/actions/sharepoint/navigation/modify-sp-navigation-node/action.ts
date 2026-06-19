import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import { buildNavigationNodeUpdateProps, getNavigationCollection, getNavigationNodeInfoByTitle, getNavigationNodeMismatches } from "../../domains/navigation";
import { buildAmbiguousNavigationNodeWarning, buildNavigationScopeDelta, checkNavigationManageWebPermission, getNavigationCompliancePrerequisites } from "../_shared/scope";
import { modifySPNavigationNodeSchema, type ModifySPNavigationNodePayload } from "./schema";
import "@pnp/sp/navigation";

export class ModifySPNavigationNodeAction extends ActionDefinition<
  "modifySPNavigationNode",
  typeof modifySPNavigationNodeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "modifySPNavigationNode";
  readonly actionSchema = modifySPNavigationNodeSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<ModifySPNavigationNodePayload>): Promise<PermissionCheckResult> {
    return checkNavigationManageWebPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<ModifySPNavigationNodePayload>): Promise<M365ActionResult> {
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

    const updateProps = buildNavigationNodeUpdateProps(payload);
    if (Object.keys(updateProps).length === 0) return actionSkipped(payload.title, "no_changes", buildNavigationScopeDelta(ctx.scopeIn));

    const mismatches = getNavigationNodeMismatches(payload, existing.node, { webUrl: ctx.scopeIn.webUrl });
    if (mismatches.length === 0) return actionSkipped(payload.title, "no_changes", buildNavigationScopeDelta(ctx.scopeIn));

    await getNavigationCollection(web, payload.location).getById(existing.node.Id).update(updateProps);
    return actionExecuted(payload.title, buildNavigationScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, ModifySPNavigationNodePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const payload = ctx.action.payload;
    const prerequisites = getNavigationCompliancePrerequisites(ctx, payload.title);
    if (prerequisites.ok === false) return prerequisites.result;

    try {
      const existing = await getNavigationNodeInfoByTitle(prerequisites.web, payload.location, payload.title);
      if (existing.kind === "missing") return nonCompliant({ resource: payload.title, reason: "not_found" });
      if (existing.kind === "ambiguous") return nonCompliant({ resource: payload.title, reason: "ambiguous" });

      const mismatches = getNavigationNodeMismatches(payload, existing.node, { webUrl: ctx.scopeIn.webUrl });
      return mismatches.length === 0
        ? compliant({ resource: payload.title, scopeDelta: buildNavigationScopeDelta(ctx.scopeIn) })
        : nonCompliant({ resource: payload.title, reason: "drift", details: { mismatches } });
    } catch (error) {
      return unverifiableError(payload.title, error);
    }
  }
}
