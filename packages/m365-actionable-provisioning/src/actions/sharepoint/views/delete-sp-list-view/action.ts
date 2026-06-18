import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type {
  M365ActionResult,
  M365Clients,
  M365RuntimeContext,
  M365Scope,
  ProvisioningResultLight,
  ProvisioningWarning,
} from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import { getPublicListViewInfoByTitle } from "../../domains/views";

import {
  buildListViewScopeDelta,
  checkListViewManageListsPermission,
  getListViewCompliancePrerequisites,
} from "../_shared/scope";
import { deleteSPListViewSchema, type DeleteSPListViewPayload } from "./schema";

import "@pnp/sp/views";

function buildDefaultViewDeleteWarning(title: string): ProvisioningWarning {
  return {
    code: "LIST_VIEW_DEFAULT_DELETE_BLOCKED",
    message: "The current default SharePoint list view cannot be deleted by deleteSPListView V1. Set another view as default first.",
    details: { title },
  };
}

export class DeleteSPListViewAction extends ActionDefinition<
  "deleteSPListView",
  typeof deleteSPListViewSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "deleteSPListView";
  readonly actionSchema = deleteSPListViewSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<DeleteSPListViewPayload>): Promise<PermissionCheckResult> {
    return checkListViewManageListsPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<DeleteSPListViewPayload>): Promise<M365ActionResult> {
    const list = ctx.scopeIn.list;
    const payload = ctx.action.payload;
    if (!list) return actionSkipped(payload.title, "missing_prerequisite");

    const info = await getPublicListViewInfoByTitle(list, payload.title);
    if (!info) return actionSkipped(payload.title, "not_found", buildListViewScopeDelta(ctx.scopeIn));

    if (info.DefaultView) {
      return actionSkipped(payload.title, "unsupported", buildListViewScopeDelta(ctx.scopeIn), [buildDefaultViewDeleteWarning(payload.title)]);
    }

    await list.views.getById(info.Id).delete();
    return actionExecuted(payload.title, buildListViewScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, DeleteSPListViewPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const resource = ctx.action.payload.title;
    const prerequisites = getListViewCompliancePrerequisites(ctx, resource);
    if (prerequisites.ok === false) return prerequisites.result;
    const { list } = prerequisites;

    try {
      const info = await getPublicListViewInfoByTitle(list, resource);
      if (!info) return compliant({ resource });

      return nonCompliant({
        resource,
        reason: info.DefaultView ? "default_view" : "exists",
        details: info.DefaultView ? { blocked: true } : undefined,
      });
    } catch (error) {
      return unverifiableError(resource, error);
    }
  }
}
