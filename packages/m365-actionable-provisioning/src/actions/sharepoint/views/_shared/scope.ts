import type { IList } from "@pnp/sp/lists";

import type { ComplianceActionCheckResult } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365Clients, M365Scope } from "../../../../runtime";
import { unverifiable } from "../../_shared/action-results";
import { probeManageListsPermission } from "../../domains/lists";

type ListViewRuntimeContext = Readonly<{
  clients: M365Clients;
  scopeIn: M365Scope;
}>;

type ListViewCompliancePrerequisites =
  | Readonly<{ ok: true; list: IList }>
  | Readonly<{ ok: false; result: ComplianceActionCheckResult<M365Scope> }>;

export function buildListViewScopeDelta(scope: M365Scope): Partial<M365Scope> {
  const delta: Partial<M365Scope> = {};
  if (scope.list !== undefined) delta.list = scope.list;
  if (scope.web !== undefined) delta.web = scope.web;
  if (scope.webUrl !== undefined) delta.webUrl = scope.webUrl;
  if (scope.listName !== undefined) delta.listName = scope.listName;
  return delta;
}

export async function checkListViewManageListsPermission(ctx: ListViewRuntimeContext): Promise<PermissionCheckResult> {
  if (!ctx.clients.spfi) return { decision: "deny", message: "SPFI instance not available in scope" };
  if (!ctx.scopeIn.web) {
    return { decision: "unknown", message: "SharePoint web scope not available for list view permission probe" };
  }
  return probeManageListsPermission(ctx.scopeIn.web, ctx.scopeIn.webUrl ?? "(scope)");
}

export function getListViewCompliancePrerequisites(
  ctx: ListViewRuntimeContext,
  resource: string
): ListViewCompliancePrerequisites {
  if (!ctx.clients.spfi) {
    return {
      ok: false,
      result: unverifiable({ resource, reason: "missing_prerequisite", message: "SPFI instance not available in scope" }),
    };
  }
  if (!ctx.scopeIn.list) {
    return {
      ok: false,
      result: unverifiable({ resource, reason: "missing_prerequisite", message: "SharePoint list scope not available" }),
    };
  }
  return { ok: true, list: ctx.scopeIn.list };
}
