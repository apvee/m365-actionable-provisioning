/**
 * DeleteSPSite action definition.
 *
 * @remarks
 * Deletes a SharePoint site collection.
 *
 * Root-level action only. No subactions allowed.
 *
 * The Zod schema for this action is defined in `catalogs/schemas/sites`.
 *
 * @packageDocumentation
 */

import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import { normalizeError } from "../../../../core";
import type { SPScope, SPRuntimeContext, SPActionResult } from "../../../types";
import { Site } from "@pnp/sp/sites";
import { PermissionKind } from "@pnp/sp/security";
import "@pnp/sp/webs";
import "@pnp/sp/security/web";

import { deleteSPSiteSchema, type DeleteSPSitePayload } from "../../schemas/sites/delete-sp-site.schema";

/* ========================================
   ACTION DEFINITION
   ======================================== */

/**
 * DeleteSPSite action implementation.
 * 
 * @remarks
 * Deletes a SharePoint site collection.
 * 
 * **Important limitation (SharePoint Online):**
 * Group-connected Team Sites (sites attached to a Microsoft 365 Group) cannot be deleted
 * via `/_api/SPSiteManager/Delete` (which is what PnPjs `Site.delete()` uses).
 * Those sites must be deleted by deleting the associated Microsoft 365 Group.
 * 
 * **Permission Requirements:**
 * - Tenant administrator role
 * - SharePoint Admin Center access
 * 
 * **Scope Output:** None (destructive operation)
 * 
 * @public
 */
export class DeleteSPSiteAction extends ActionDefinition<
  "deleteSPSite",
  typeof deleteSPSiteSchema,
  SPScope
> {
  readonly verb = "deleteSPSite";
  readonly actionSchema = deleteSPSiteSchema;

  /**
   * Checks permissions for site deletion.
   * 
   * @param ctx - Action runtime context
   * @returns Permission check result
   * 
   * @remarks
   * Site deletion requires either:
   * - Tenant administrator role, or
   * - Site Collection Administrator on the target site
   * 
   * Note: Group-connected sites require M365 Group deletion instead.
   */
  override async checkPermissions(
    ctx: SPRuntimeContext<DeleteSPSitePayload>
  ): Promise<PermissionCheckResult> {
    const spfi = ctx.scopeIn.spfi;
    if (!spfi) {
      return {
        decision: "deny",
        message: "SPFI instance not available in scope"
      };
    }

    const { siteUrl } = ctx.action.payload;

    // Check if site exists first
    try {
      const exists = await spfi.site.exists(siteUrl);
      if (!exists) {
        // Site doesn't exist - deletion will be a no-op (skipped)
        return {
          decision: "allow",
          message: `Site does not exist, deletion will be skipped. siteUrl=${siteUrl}`
        };
      }
    } catch (e) {
      return {
        decision: "unknown",
        message: `Could not verify site existence. siteUrl=${siteUrl}. error=${String(e)}`
      };
    }

    // Bind to target site and check permissions
    const targetSite = Site([spfi.site, siteUrl]);
    try {
      const rootWeb = await targetSite.getRootWeb();
      
      // Check if user is Site Collection Admin (required for deletion)
      const canManageSite = await rootWeb.currentUserHasPermissions(PermissionKind.ManageWeb);
      if (!canManageSite) {
        return {
          decision: "deny",
          message: `Access denied: current user lacks site management permissions. siteUrl=${siteUrl}`
        };
      }

      return {
        decision: "allow",
        message: `Permission probe passed. siteUrl=${siteUrl}`
      };
    } catch (e) {
      return {
        decision: "unknown",
        message: `Permission probe could not be completed. siteUrl=${siteUrl}. error=${String(e)}`
      };
    }
  }

  /**
   * Deletes a SharePoint site collection.
   * 
   * @param ctx - Action runtime context
   * @returns Action result with deletion confirmation
   * 
   * @remarks
   * Uses PnPjs Site.delete() to remove the site collection.
   * Group-connected sites will throw an error with guidance to delete the M365 Group instead.
   */
  override async handler(
    ctx: SPRuntimeContext<DeleteSPSitePayload>
  ): Promise<SPActionResult> {
    const { siteUrl } = ctx.action.payload;

    const spfi = ctx.scopeIn.spfi;
    if (!spfi) {
      throw new Error("SPFI instance not available in scope");
    }

    // Idempotency: if the site doesn't exist, treat as success (skipped)
    const exists = await spfi.site.exists(siteUrl);
    if (!exists) {
      ctx.logger.info("Site does not exist - skipping deletion", { siteUrl });
      return {
        result: {
          outcome: "skipped",
          resource: siteUrl,
          reason: "not_found",
        },
      };
    }

    ctx.logger.info("Deleting site collection", { siteUrl });

    // Bind the Site instance to the current SPFI context so it uses the configured auth/behaviors.
    const targetSite = Site([spfi.site, siteUrl]);

    // SharePoint blocks deletion via SPSiteManager/Delete for group-connected sites.
    // Use getRootWeb() (vs rootWeb property) to ensure the Web instance is created with its own Url.
    try {
      const rootWeb = await targetSite.getRootWeb();
      const rootWebInfo = await rootWeb.select("GroupId")();
      const groupId = (rootWebInfo as { GroupId?: string }).GroupId;

      if (groupId && groupId !== "00000000-0000-0000-0000-000000000000") {
        throw new Error(
          `Deletion of a site attached to a Microsoft 365 Group is not allowed via SPSiteManager/Delete. ` +
          `Delete the associated Microsoft 365 Group instead. siteUrl=${siteUrl} groupId=${groupId}`
        );
      }
    } catch (e) {
      // If we cannot read GroupId (permissions/tenant settings), proceed and let the delete attempt decide.
      // If it's already our explicit error, rethrow it.
      if (e instanceof Error && e.message.includes("Microsoft 365 Group")) throw e;
    }

    try {
      await targetSite.delete();
    } catch (e) {
      // Fallback: if the platform returns the known group-connected error, provide a clearer message.
      const msg = normalizeError(e).message;
      if (msg.includes("Deletion of a site attached to an Office 365 Group is not allowed")) {
        throw new Error(
          `Cannot delete a group-connected Team Site via SPSiteManager/Delete. ` +
          `Delete the associated Microsoft 365 Group instead. siteUrl=${siteUrl}`
        );
      }
      throw e;
    }

    ctx.logger.info("Site deletion request completed", { siteUrl });
    return {
      result: {
        outcome: "executed",
        resource: siteUrl,
      },
    };
  }

  override async checkCompliance(
    ctx: ComplianceRuntimeContext<SPScope, DeleteSPSitePayload>
  ): Promise<ComplianceActionCheckResult<SPScope>> {
    const spfi = ctx.scopeIn.spfi;
    if (!spfi) {
      return { outcome: "unverifiable", reason: "missing_prerequisite", message: "SPFI instance not available in scope" };
    }

    const { siteUrl } = ctx.action.payload;
    try {
      const exists = await spfi.site.exists(siteUrl);
      if (!exists) {
        return { outcome: "compliant", resource: siteUrl };
      }
      return { outcome: "non_compliant", resource: siteUrl, reason: "still_exists" };
    } catch (e) {
      return {
        outcome: "unverifiable",
        resource: siteUrl,
        reason: "error",
        message: normalizeError(e).message,
      };
    }
  }
}
