import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import { probeManageListsPermission } from "../../domains/lists";
import {
  buildListViewCreateProps,
  buildListViewUpdateProps,
  compareListViewState,
  getListViewByTitle,
  getListViewInfoByTitle,
  getViewFieldNames,
  replaceViewFields,
  validateViewFields,
} from "../../domains/views";

import { createSPListViewSchema, type CreateSPListViewPayload } from "./schema";

import "@pnp/sp/views";

export class CreateSPListViewAction extends ActionDefinition<
  "createSPListView",
  typeof createSPListViewSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "createSPListView";
  readonly actionSchema = createSPListViewSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<CreateSPListViewPayload>): Promise<PermissionCheckResult> {
    if (!ctx.clients.spfi) return { decision: "deny", message: "SPFI instance not available in scope" };
    const web = ctx.scopeIn.web;
    if (!web) return { decision: "unknown", message: "SharePoint web scope not available for list view permission probe" };
    return probeManageListsPermission(web, ctx.scopeIn.webUrl ?? "(scope)");
  }

  async handler(ctx: M365RuntimeContext<CreateSPListViewPayload>): Promise<M365ActionResult> {
    const list = ctx.scopeIn.list;
    const payload = ctx.action.payload;
    if (!list) return actionSkipped(payload.title, "missing_prerequisite");

    const existingInfo = await getListViewInfoByTitle(list, payload.title);
    if (!existingInfo && payload.fields !== undefined) {
      await validateViewFields(list, payload.fields);
    }

    const view = existingInfo
      ? getListViewByTitle(list, payload.title)
      : getListViewByTitle(list, (await list.views.add(payload.title, false, buildListViewCreateProps())).Title);

    const updateProps = buildListViewUpdateProps(payload);
    if (payload.fields !== undefined) {
      await replaceViewFields(list, view, payload.fields);
    }
    if (Object.keys(updateProps).length > 0) {
      await view.update(updateProps);
    }

    const appliedState = !existingInfo || Object.keys(updateProps).length > 0 || payload.fields !== undefined;

    const scopeDelta = {
      list,
      web: ctx.scopeIn.web,
      webUrl: ctx.scopeIn.webUrl,
      listName: ctx.scopeIn.listName,
    };

    return existingInfo && !appliedState
      ? actionSkipped(payload.title, "already_exists", scopeDelta)
      : actionExecuted(payload.title, scopeDelta);
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, CreateSPListViewPayload, M365Clients>
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
      if (!info) return nonCompliant({ resource, reason: "not_found" });

      const fields = ctx.action.payload.fields !== undefined
        ? await getViewFieldNames(getListViewByTitle(list, resource))
        : undefined;
      const mismatches = compareListViewState(ctx.action.payload, info, fields);

      return mismatches.length === 0
        ? compliant({
          resource,
          scopeDelta: { list, web: ctx.scopeIn.web, webUrl: ctx.scopeIn.webUrl, listName: ctx.scopeIn.listName },
        })
        : nonCompliant({ resource, reason: "drift", details: { mismatches } });
    } catch (error) {
      return unverifiableError(resource, error);
    }
  }
}
