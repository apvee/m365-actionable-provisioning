/**
 * Permission check helpers for SharePoint provisioning actions.
 *
 * @remarks
 * Provides standardized permission check patterns for list and site operations.
 * Wraps SPFI validation, web resolution, and permission probing.
 *
 * @module provisioning/shared/permission-helpers
 * @internal
 */

import type { PermissionCheckResult } from "../../core/permissions";
import type { SPRuntimeContext } from "../types";
import { resolveTargetWeb } from "../utils/sp-utils";
import { probeManageListsPermission } from "./domains/lists/list-permissions";

/**
 * Payload shape for list operations requiring web resolution.
 */
export interface ListOperationPayload extends Record<string, unknown> {
  webUrl?: string;
  siteUrl?: string;
}

/**
 * Payload shape for site operations.
 */
export interface SiteOperationPayload extends Record<string, unknown> {
  url?: string;
  webUrl?: string;
}

/**
 * Standard permission check for list operations.
 *
 * @remarks
 * Performs the standard permission check flow:
 * 1. Validates SPFI is available in scope
 * 2. Resolves target web URL from payload or scope
 * 3. Probes ManageLists permission on the resolved web
 *
 * @param ctx - Action runtime context with list operation payload
 * @returns Permission check result (allow, deny, or unknown)
 *
 * @example
 * ```typescript
 * async checkPermissions(ctx: SPRuntimeContext<CreateSPListPayload>): Promise<PermissionCheckResult> {
 *   return checkListOperationPermission(ctx);
 * }
 * ```
 */
export async function checkListOperationPermission<
  T extends ListOperationPayload
>(ctx: SPRuntimeContext<T>): Promise<PermissionCheckResult> {
  const scopeIn = ctx.scopeIn;
  const spfi = scopeIn.spfi;

  if (!spfi) {
    return {
      decision: "deny",
      message: "SPFI instance not available in scope",
    };
  }

  const { web, effectiveWebUrl } = await resolveTargetWeb({
    spfi,
    scopeWeb: scopeIn.web,
    webUrl: ctx.action.payload.webUrl,
    siteUrl: ctx.action.payload.siteUrl,
  });

  return probeManageListsPermission(web, effectiveWebUrl);
}

/**
 * Standard permission check for site operations.
 *
 * @remarks
 * Performs the standard permission check flow for site-level operations.
 * Currently returns unknown as site permission checks require different logic.
 *
 * @param ctx - Action runtime context with site operation payload
 * @returns Permission check result (allow, deny, or unknown)
 *
 * @example
 * ```typescript
 * async checkPermissions(ctx: SPRuntimeContext<CreateSPSitePayload>): Promise<PermissionCheckResult> {
 *   return checkSiteOperationPermission(ctx);
 * }
 * ```
 */
export async function checkSiteOperationPermission<
  T extends SiteOperationPayload
>(ctx: SPRuntimeContext<T>): Promise<PermissionCheckResult> {
  const scopeIn = ctx.scopeIn;
  const spfi = scopeIn.spfi;

  if (!spfi) {
    return {
      decision: "deny",
      message: "SPFI instance not available in scope",
    };
  }

  // Site operations typically require site collection admin or specific permissions
  // Return unknown to indicate permission cannot be determined without more context
  return {
    decision: "unknown",
    message: "Site operation permissions require additional context",
  };
}
