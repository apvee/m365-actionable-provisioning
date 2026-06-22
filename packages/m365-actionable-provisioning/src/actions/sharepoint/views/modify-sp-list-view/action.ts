import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import {
  buildListViewUpdateProps,
  getListViewFieldResolutionDriftDetails,
  getPublicListViewInfoByTitle,
  getListViewStateMismatches,
  hasScalarChanges,
  replaceViewFields,
} from "../../domains/views";

import {
  buildListViewScopeDelta,
  checkListViewManageListsPermission,
  getListViewCompliancePrerequisites,
} from "../_shared/scope";
import { modifySPListViewSchema, type ModifySPListViewPayload } from "./schema";

import "@pnp/sp/views";

export class ModifySPListViewAction extends ActionDefinition<
  "modifySPListView",
  typeof modifySPListViewSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "modifySPListView";
  readonly actionSchema = modifySPListViewSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<ModifySPListViewPayload>): Promise<PermissionCheckResult> {
    return checkListViewManageListsPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<ModifySPListViewPayload>): Promise<M365ActionResult> {
    const list = ctx.scopeIn.list;
    const payload = ctx.action.payload;
    if (!list) return actionSkipped(payload.title, "missing_prerequisite");

    const existing = await getPublicListViewInfoByTitle(list, payload.title);
    if (!existing) return actionSkipped(payload.title, "not_found", buildListViewScopeDelta(ctx.scopeIn));

    const view = list.views.getById(existing.Id);
    const scalarChanges = hasScalarChanges(payload, existing);
    const fieldChanged = payload.fields !== undefined
      ? await replaceViewFields(list, view, payload.fields)
      : false;

    if (!scalarChanges && !fieldChanged) return actionSkipped(payload.title, "no_changes", buildListViewScopeDelta(ctx.scopeIn));

    if (scalarChanges) {
      await view.update(buildListViewUpdateProps(payload));
    }

    return actionExecuted(payload.title, buildListViewScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, ModifySPListViewPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const payload = ctx.action.payload;
    const prerequisites = getListViewCompliancePrerequisites(ctx, payload.title);
    if (prerequisites.ok === false) return prerequisites.result;
    const { list } = prerequisites;

    try {
      const info = await getPublicListViewInfoByTitle(list, payload.title);
      if (!info) return nonCompliant({ resource: payload.title, reason: "not_found" });

      const view = payload.fields !== undefined ? list.views.getById(info.Id) : undefined;
      const mismatches = await getListViewStateMismatches(list, view, payload, info);

      return mismatches.length === 0
        ? compliant({
          resource: payload.title,
          scopeDelta: buildListViewScopeDelta(ctx.scopeIn),
        })
        : nonCompliant({ resource: payload.title, reason: "drift", details: { mismatches } });
    } catch (error) {
      const fieldResolutionDetails = getListViewFieldResolutionDriftDetails(error);
      if (fieldResolutionDetails) return nonCompliant({ resource: payload.title, reason: "drift", details: fieldResolutionDetails });
      return unverifiableError(payload.title, error);
    }
  }
}
