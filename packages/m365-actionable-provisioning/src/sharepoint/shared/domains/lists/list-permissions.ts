/**
 * List permission utilities for SharePoint provisioning.
 *
 * @remarks
 * Provides functions for probing list-related permissions.
 * Extracted from catalogs/actions/lists/base.helpers.ts for reuse.
 *
 * @module provisioning/shared/domains/lists/list-permissions
 * @internal
 */

import "@pnp/sp/webs";
import "@pnp/sp/security/web";
import type { IWeb } from "@pnp/sp/webs";
import { PermissionKind } from "@pnp/sp/security";
import type { PermissionCheckResult } from "../../../../core/permissions";

/**
 * Best-effort permission probe for ManageLists on a web.
 *
 * @remarks
 * Uses the PnPjs `currentUserHasPermissions` API to check if the current
 * user can manage lists on the target web. Returns a standardized
 * PermissionCheckResult.
 *
 * @param web - The PnPjs IWeb instance to check permissions on
 * @param effectiveWebUrl - The resolved web URL for error messages
 * @returns Permission check result (allow, deny, or unknown)
 *
 * @example
 * ```typescript
 * const { web, effectiveWebUrl } = await resolveTargetWeb({ spfi, scopeWeb, webUrl });
 * const permission = await probeManageListsPermission(web, effectiveWebUrl);
 * if (permission.decision === "deny") {
 *   throw new Error(permission.message);
 * }
 * ```
 */
export async function probeManageListsPermission(
  web: IWeb,
  effectiveWebUrl: string
): Promise<PermissionCheckResult> {
  try {
    const canManageLists = await web.currentUserHasPermissions(
      PermissionKind.ManageLists
    );

    if (!canManageLists) {
      return {
        decision: "deny",
        message: `Access denied: current user lacks Manage Lists on target web. webUrl=${effectiveWebUrl}`,
      };
    }

    return {
      decision: "allow",
      message: `Permission probe passed (ManageLists). webUrl=${effectiveWebUrl}`,
    };
  } catch (e) {
    return {
      decision: "unknown",
      message: `Permission probe could not be completed. webUrl=${effectiveWebUrl}. error=${String(e)}`,
    };
  }
}
