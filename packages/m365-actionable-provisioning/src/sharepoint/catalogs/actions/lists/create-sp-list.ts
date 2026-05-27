/**
 * CreateSPList action definition.
 * 
 * @remarks
 * Creates a new SharePoint list.
 * 
 * **Dual-mode action:**
 * - Root-level: Provide `webUrl` or `siteUrl` in payload
 * - Subaction: Uses parent-provided `web` handle from scope
 * 
 * The list is created using `listName` as the stable **RootFolder/Name** (URL-friendly),
 * and then updated to apply the user-friendly display `title`.
 *
 * Allows field subactions.
 *
 * The Zod schema for this action is defined in `catalogs/schemas/lists`.
 * 
 * @packageDocumentation
 */

import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import { normalizeError } from "../../../../core";
import type { SPScope, SPRuntimeContext, SPActionResult } from "../../../types";
import { pickDefined } from "../../../utils/object-utils";
import { getListInfoByRootFolderName, probeManageListsPermission, resolveWebUrlString } from "./base.helpers";

import { createSPListSchema, type CreateSPListPayload } from "../../schemas/lists/create-sp-list.schema";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/security/web";
import { IListInfo } from "@pnp/sp/lists";
import { resolveTargetWeb } from "../../../utils/sp-utils";

/* ========================================
   ACTION DEFINITION
   ======================================== */

/**
 * CreateSPList action implementation.
 * 
 * @remarks
 * Creates a SharePoint list and propagates list context to scope.
 * 
 * **Permission Requirements:**
 * - Manage Lists permission on the web
 * 
 * **Scope Output:**
 * - `web`: PnPjs Web handle bound to the target web
 * - `list`: PnPjs List handle bound to the created/resolved list
 * 
 * @public
 */
export class CreateSPListAction extends ActionDefinition<
  "createSPList",
  typeof createSPListSchema,
  SPScope
> {
  readonly verb = "createSPList";
  readonly actionSchema = createSPListSchema;

  /**
   * Checks permissions for list creation.
   * 
   * @param ctx - Action runtime context
   * @returns Permission check result
   * 
   * @remarks
   * Resolves the target web URL (payload → scope → SPFI site URL) and runs a best-effort
   * permission probe for `ManageLists`.
   */
  override async checkPermissions(
    ctx: SPRuntimeContext<CreateSPListPayload>
  ): Promise<PermissionCheckResult> {
    const scopeIn = ctx.scopeIn;
    const spfi = scopeIn.spfi;
    if (!spfi) {
      return { decision: "deny", message: "SPFI instance not available in scope" };
    }

    const { web, effectiveWebUrl } = await resolveTargetWeb({
      spfi,
      scopeWeb: scopeIn.web,
      webUrl: ctx.action.payload.webUrl,
      siteUrl: ctx.action.payload.webUrl ? undefined : ctx.action.payload.siteUrl,
    });

    return probeManageListsPermission(web, effectiveWebUrl);
  }

  override async checkCompliance(
    ctx: ComplianceRuntimeContext<SPScope, CreateSPListPayload>
  ): Promise<ComplianceActionCheckResult<SPScope>> {
    const spfi = ctx.scopeIn.spfi;
    if (!spfi) {
      return { outcome: "unverifiable", reason: "missing_prerequisite", message: "SPFI instance not available in scope" };
    }

    const { web } = await resolveTargetWeb({
      spfi,
      scopeWeb: ctx.scopeIn.web,
      webUrl: ctx.action.payload.webUrl,
      siteUrl: ctx.action.payload.webUrl ? undefined : ctx.action.payload.siteUrl,
    });

    const listName = ctx.action.payload.listName;
    try {
      const found = await getListInfoByRootFolderName(web, listName);
      if (!found?.Id) {
        return { outcome: "non_compliant", resource: listName, reason: "not_found" };
      }

      const list = web.lists.getById(found.Id);
      return {
        outcome: "compliant",
        resource: listName,
        scopeDelta: { web, list },
      };
    } catch (e) {
      return {
        outcome: "unverifiable",
        resource: listName,
        reason: "error",
        message: normalizeError(e).message,
      };
    }
  }

  /**
   * Creates a SharePoint list.
   * 
   * @param ctx - Action runtime context
   * @returns Action result with created list details
   * 
   * @remarks
   * Implements a two-step strategy:
   * 1) Create list using `listName` as Title (to get stable RootFolder/Name)
   * 2) Update the list Title to the user-friendly `title`
   */
  override async handler(
    ctx: SPRuntimeContext<CreateSPListPayload>
  ): Promise<SPActionResult> {
    const scopeIn = ctx.scopeIn;
    const spfi = scopeIn.spfi;
    if (!spfi) {
      throw new Error("SPFI instance not available in scope");
    }

    const { web, effectiveWebUrl } = await resolveTargetWeb({
      spfi,
      scopeWeb: scopeIn.web,
      webUrl: ctx.action.payload.webUrl,
      // IMPORTANT: only pass payload-provided siteUrl.
      // If we pass a spfi-derived fallback siteUrl here, it would override scopeWeb
      // (because resolveTargetWeb prioritizes siteUrl over scopeWeb) and accidentally
      // target the webpart host site instead of the intended scoped target.
      siteUrl: ctx.action.payload.webUrl ? undefined : ctx.action.payload.siteUrl,
    });

    const resolvedWebUrl = await resolveWebUrlString(web, effectiveWebUrl);
    const listName = ctx.action.payload.listName;
    const displayTitle = ctx.action.payload.title;

    // Idempotency: check by RootFolder/Name
    const existing = await getListInfoByRootFolderName(web, listName);
    if (existing?.Id) {
      ctx.logger.info("List already exists - skipping creation", {
        webUrl: resolvedWebUrl,
        listName,
        listId: existing.Id,
      });

      return {
        result: {
          outcome: "skipped",
          resource: listName,
          reason: "already_exists",
        },
        scopeDelta: {
          web,
          list: web.lists.getById(existing.Id),
        },
      };
    }

    const additionalSettings: Partial<IListInfo> = pickDefined({
      Hidden: ctx.action.payload.hidden,
      OnQuickLaunch: ctx.action.payload.onQuickLaunch,
      EnableAttachments: ctx.action.payload.enableAttachments,
      EnableFolderCreation: ctx.action.payload.enableFolderCreation,
      EnableVersioning: ctx.action.payload.enableVersioning,
      EnableMinorVersions: ctx.action.payload.enableMinorVersions,
      ForceCheckout: ctx.action.payload.forceCheckout,
      MajorVersionLimit: ctx.action.payload.majorVersionLimit,
      MajorWithMinorVersionsLimit: ctx.action.payload.majorWithMinorVersionsLimit,
      DraftVersionVisibility: ctx.action.payload.draftVersionVisibility,
      ReadSecurity: ctx.action.payload.readSecurity,
      WriteSecurity: ctx.action.payload.writeSecurity,
      NoCrawl: ctx.action.payload.noCrawl,
      EnableModeration: ctx.action.payload.enableModeration,

    });

    const createDescription = ctx.action.payload.desc ?? "";
    const template = ctx.action.payload.template;
    const enableContentTypes = ctx.action.payload.enableContentTypes ?? false;

    // Step 1: create list with URL-friendly name
    const created = await web.lists.add(
      listName,
      createDescription,
      template,
      enableContentTypes,
      additionalSettings
    );

    // Step 2: resolve list id (prefer response Id, fallback to RootFolder/Name lookup)
    const createdId = (created as { Id?: string }).Id;
    const listId = createdId ?? (await getListInfoByRootFolderName(web, listName))?.Id;
    if (!listId) {
      throw new Error(
        `List was created but Id could not be determined. webUrl=${resolvedWebUrl}, listName=${listName}`
      );
    }

    // Step 3: update display title
    await web.lists.getById(listId).update({ Title: displayTitle });

    ctx.logger.info("List created successfully", {
      webUrl: resolvedWebUrl,
      listId,
      listName,
      title: displayTitle,
      template,
    });

    return {
      result: {
        outcome: "executed",
        resource: listName,
      },
      scopeDelta: {
        web,
        list: web.lists.getById(listId),
      },
    };
  }
}
