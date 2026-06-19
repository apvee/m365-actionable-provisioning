import type { ComplianceActionCheckResult, ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365Clients, M365RuntimeContext, M365Scope, ProvisioningWarning } from "../../../../runtime";
import type { SPNavigationLocation } from "./schema";
import { PermissionKind } from "@pnp/sp/security";
import "@pnp/sp/security/web";

export function buildNavigationScopeDelta(scopeIn: M365Scope): Partial<M365Scope> {
  return {
    ...(scopeIn.site ? { site: scopeIn.site } : {}),
    ...(scopeIn.web ? { web: scopeIn.web } : {}),
    ...(scopeIn.siteUrl ? { siteUrl: scopeIn.siteUrl } : {}),
    ...(scopeIn.webUrl ? { webUrl: scopeIn.webUrl } : {}),
  };
}

export async function checkNavigationManageWebPermission<TPayload extends Record<string, unknown>>(
  ctx: M365RuntimeContext<TPayload>
): Promise<PermissionCheckResult> {
  const web = ctx.scopeIn.web;
  if (!web) {
    return { decision: "unknown", message: "Unable to verify navigation permissions without web scope" };
  }

  try {
    const canManageWeb = await web.currentUserHasPermissions(PermissionKind.ManageWeb);
    return canManageWeb
      ? { decision: "allow", message: "Permission probe passed (ManageWeb)." }
      : { decision: "deny", message: "Access denied: current user lacks Manage Web on target site." };
  } catch (e) {
    return { decision: "unknown", message: `Permission probe could not be completed. error=${String(e)}` };
  }
}

export function getNavigationCompliancePrerequisites<TPayload extends Record<string, unknown>>(
  ctx: ComplianceRuntimeContext<M365Scope, TPayload, M365Clients>,
  resource: string
): { ok: true; web: NonNullable<M365Scope["web"]> } | { ok: false; result: ComplianceActionCheckResult<M365Scope> } {
  const web = ctx.scopeIn.web;
  if (!web) {
    return {
      ok: false,
      result: {
        outcome: "unverifiable",
        resource,
        reason: "missing_prerequisite",
        message: "Web scope not available for SharePoint navigation action",
      },
    };
  }

  return { ok: true, web };
}

export function buildAmbiguousNavigationNodeWarning(
  location: SPNavigationLocation,
  title: string,
  matchCount: number
): ProvisioningWarning {
  return {
    code: "NAVIGATION_NODE_AMBIGUOUS_TITLE",
    message: "Multiple SharePoint navigation nodes match the requested title. The action was skipped to avoid mutating an arbitrary node.",
    details: { location, title, matchCount },
  };
}
