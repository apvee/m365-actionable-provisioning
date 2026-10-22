import type { IWeb } from "@pnp/sp/webs";
import { PermissionKind } from "@pnp/sp/security";
import type { ComplianceActionCheckResult } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365Clients, M365RuntimeContext, M365Scope } from "../../../../runtime";
import { unverifiable } from "../../_shared/action-results";
import "@pnp/sp/security/web";

export type SPGroupOperation = "create" | "modify" | "delete";

export function getSPGroupResource(payload: { groupId?: number; groupName?: string; title?: string }): string {
  return payload.groupName ?? (payload.groupId !== undefined ? String(payload.groupId) : payload.title ?? "group");
}

export async function checkSPGroupPermissions<TPayload extends Record<string, unknown>>(
  ctx: M365RuntimeContext<TPayload>,
  operation: SPGroupOperation
): Promise<PermissionCheckResult> {
  if (!ctx.clients.spfi) return { decision: "deny", message: "SPFI instance not available in scope" };

  // Preflight receives initialScope, which can belong to a different site.
  // The engine stores the site parent's result before running its children,
  // and requiredClients forces a JIT check with the newly inherited web.
  const separator = ctx.action.path.lastIndexOf("/");
  const parentPath = ctx.action.path.slice(0, separator);
  if (separator !== -1 && ctx.out.byAction[parentPath]?.result === undefined) {
    return { decision: "unknown", message: "Group permission check deferred until the site parent supplies its target" };
  }

  const web = ctx.scopeIn.web;
  if (!web) return { decision: "unknown", message: "SharePoint web scope not available for group permission probe" };
  const permission = operation === "create" ? PermissionKind.CreateGroups : PermissionKind.ManagePermissions;
  try {
    if (await web.currentUserHasPermissions(permission)) {
      return { decision: "allow", message: `Group permission probe passed (${PermissionKind[permission]})` };
    }
    return operation === "create"
      ? { decision: "deny", message: "Current user lacks CreateGroups on the target site" }
      : { decision: "unknown", message: "ManagePermissions probe is negative; group-specific ownership may still allow the operation" };
  } catch (error) {
    return { decision: "unknown", message: `Group permission probe could not be completed: ${String(error)}` };
  }
}

export function getSPGroupCompliancePrerequisites(
  ctx: { clients: M365Clients; scopeIn: M365Scope },
  resource: string
): { ok: true; web: IWeb } | { ok: false; result: ComplianceActionCheckResult<M365Scope> } {
  if (!ctx.clients.spfi || !ctx.scopeIn.web) {
    return { ok: false, result: unverifiable({
      resource,
      reason: "missing_prerequisite",
      message: !ctx.clients.spfi ? "SPFI instance not available in scope" : "SharePoint web scope not available",
    }) };
  }
  return { ok: true, web: ctx.scopeIn.web };
}
