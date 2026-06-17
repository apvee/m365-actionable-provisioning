import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import { probeManageListsPermission } from "../../domains/lists";
import { getListViewByTitle, getListViewInfoByTitle } from "../../domains/views";

import { deleteSPListViewSchema, type DeleteSPListViewPayload } from "./schema";

import "@pnp/sp/views";

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
    if (!ctx.clients.spfi) return { decision: "deny", message: "SPFI instance not available in scope" };
    const web = ctx.scopeIn.web;
    if (!web) return { decision: "unknown", message: "SharePoint web scope not available for list view permission probe" };
    return probeManageListsPermission(web, ctx.scopeIn.webUrl ?? "(scope)");
  }

  async handler(ctx: M365RuntimeContext<DeleteSPListViewPayload>): Promise<M365ActionResult> {
    const list = ctx.scopeIn.list;
    const payload = ctx.action.payload;
    if (!list) return actionSkipped(payload.title, "missing_prerequisite");

    const info = await getListViewInfoByTitle(list, payload.title);
    if (!info) return actionSkipped(payload.title, "not_found");

    if (info.DefaultView) {
      return actionSkipped(payload.title, "unsupported", undefined, [
        {
          code: "LIST_VIEW_DEFAULT_DELETE_BLOCKED",
          message: "The current default SharePoint list view cannot be deleted by deleteSPListView V1. Set another view as default first.",
          details: { title: payload.title },
        },
      ]);
    }

    await getListViewByTitle(list, payload.title).delete();
    return actionExecuted(payload.title, {
      list,
      web: ctx.scopeIn.web,
      webUrl: ctx.scopeIn.webUrl,
      listName: ctx.scopeIn.listName,
    });
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, DeleteSPListViewPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const list = ctx.scopeIn.list;
    const resource = ctx.action.payload.title;
    if (!ctx.clients.spfi) {
      return unverifiable({ resource, reason: "missing_prerequisite", message: "SPFI instance not available in scope" });
    }
    if (!list) {
      return unverifiable({ resource, reason: "missing_prerequisite", message: "SharePoint list scope not available" });
    }

    try {
      const info = await getListViewInfoByTitle(list, resource);
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
