import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import { probeManageListsPermission } from "../../domains/lists";
import {
  areViewFieldsEqual,
  buildListViewUpdateProps,
  compareListViewState,
  getListViewByTitle,
  getListViewInfoByTitle,
  getViewFieldNames,
  normalizeViewQuery,
  replaceViewFields,
} from "../../domains/views";

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
    if (!ctx.clients.spfi) return { decision: "deny", message: "SPFI instance not available in scope" };
    const web = ctx.scopeIn.web;
    if (!web) return { decision: "unknown", message: "SharePoint web scope not available for list view permission probe" };
    return probeManageListsPermission(web, ctx.scopeIn.webUrl ?? "(scope)");
  }

  async handler(ctx: M365RuntimeContext<ModifySPListViewPayload>): Promise<M365ActionResult> {
    const list = ctx.scopeIn.list;
    const payload = ctx.action.payload;
    if (!list) return actionSkipped(payload.title, "missing_prerequisite");

    const existingInfo = await getListViewInfoByTitle(list, payload.title);
    if (!existingInfo) return actionSkipped(payload.title, "not_found");

    if (payload.newTitle !== undefined && payload.newTitle !== payload.title) {
      const collision = await getListViewInfoByTitle(list, payload.newTitle);
      if (collision) {
        throw new Error(
          `Cannot rename SharePoint list view '${payload.title}' to '${payload.newTitle}' because another view already uses that title.`
        );
      }
    }

    const view = getListViewByTitle(list, payload.title);
    const updateProps = buildListViewUpdateProps(payload);
    const currentFields = payload.fields !== undefined ? await getViewFieldNames(view) : undefined;
    const hasScalarChanges = Object.entries(updateProps).some(([key, expected]) => {
      const actual = (existingInfo as Record<string, unknown>)[key];
      return key === "ViewQuery" && typeof actual === "string" && typeof expected === "string"
        ? normalizeViewQuery(actual) !== expected
        : actual !== expected;
    });
    const hasFieldChanges = payload.fields !== undefined && !areViewFieldsEqual(payload.fields, currentFields ?? []);
    const hasEffectiveChanges = hasScalarChanges || hasFieldChanges;
    if (!hasEffectiveChanges) {
      return actionSkipped(payload.title, "no_changes", {
        list,
        web: ctx.scopeIn.web,
        webUrl: ctx.scopeIn.webUrl,
        listName: ctx.scopeIn.listName,
      });
    }

    if (payload.fields !== undefined && hasFieldChanges) {
      await replaceViewFields(list, view, payload.fields);
    }
    if (hasScalarChanges) {
      await view.update(updateProps);
    }

    return actionExecuted(payload.newTitle ?? payload.title, {
      list,
      web: ctx.scopeIn.web,
      webUrl: ctx.scopeIn.webUrl,
      listName: ctx.scopeIn.listName,
    });
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, ModifySPListViewPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const list = ctx.scopeIn.list;
    const payload = ctx.action.payload;
    const targetTitle = payload.newTitle ?? payload.title;
    if (!ctx.clients.spfi) {
      return unverifiable({ resource: targetTitle, reason: "missing_prerequisite", message: "SPFI instance not available in scope" });
    }
    if (!list) {
      return unverifiable({ resource: targetTitle, reason: "missing_prerequisite", message: "SharePoint list scope not available" });
    }

    try {
      const originalInfo = await getListViewInfoByTitle(list, payload.title);
      const renamedInfo = payload.newTitle !== undefined ? await getListViewInfoByTitle(list, payload.newTitle) : undefined;
      if (payload.newTitle !== undefined && renamedInfo && originalInfo && renamedInfo.Id !== originalInfo.Id) {
        return nonCompliant({
          resource: targetTitle,
          reason: "title_collision",
          details: { title: payload.title, newTitle: payload.newTitle },
        });
      }

      const info = renamedInfo ?? originalInfo;
      if (!info) return nonCompliant({ resource: targetTitle, reason: "not_found" });
      if (payload.newTitle !== undefined && !renamedInfo) {
        return nonCompliant({ resource: targetTitle, reason: "rename_pending" });
      }

      const fields = payload.fields !== undefined
        ? await getViewFieldNames(getListViewByTitle(list, targetTitle))
        : undefined;
      const mismatches = compareListViewState({ ...payload, newTitle: undefined }, info, fields);

      return mismatches.length === 0
        ? compliant({
          resource: targetTitle,
          scopeDelta: { list, web: ctx.scopeIn.web, webUrl: ctx.scopeIn.webUrl, listName: ctx.scopeIn.listName },
        })
        : nonCompliant({ resource: targetTitle, reason: "drift", details: { mismatches } });
    } catch (error) {
      return unverifiableError(targetTitle, error);
    }
  }
}
