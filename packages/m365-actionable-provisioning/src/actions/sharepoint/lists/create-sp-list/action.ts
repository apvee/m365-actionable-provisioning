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
 * The Zod schema for this action is co-located in `schema.ts`.
 * 
 * @packageDocumentation
 */

import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365Clients, ProvisioningResultLight, M365Scope, M365RuntimeContext, M365ActionResult, ProvisioningWarning } from "../../../../runtime";
import { pickDefined } from "../../utils/object-utils";
import { getListInfoByRootFolderName, probeManageListsPermission, resolveWebUrlString } from "../../domains/lists";
import { checkListStructuralCompatibility } from "../../domains/lists/list-structural-compatibility";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";

import { createSPListSchema, type CreateSPListPayload } from "./schema";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/security/web";
import { IListInfo } from "@pnp/sp/lists";
import { resolveTargetWeb } from "../../utils/sp-utils";

/* ========================================
   ACTION DEFINITION
   ======================================== */

function buildListStructuralWarning(
  listName: string,
  compatibility: ReturnType<typeof checkListStructuralCompatibility>
): ProvisioningWarning | undefined {
  if (!("reason" in compatibility)) return undefined;

  if (compatibility.reason === "list_template_unverifiable") {
    return {
      code: "LIST_TEMPLATE_UNVERIFIABLE",
      message: "List already exists, but its template could not be verified.",
      details: { listName, expectedTemplate: compatibility.expectedTemplate },
    };
  }

  return {
    code: "LIST_STRUCTURAL_COLLISION",
    message: "List already exists with a template that does not match the create action payload.",
    details: {
      listName,
      expectedTemplate: compatibility.expectedTemplate,
      actualTemplate: compatibility.actualTemplate,
    },
  };
}

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
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "createSPList";
  readonly actionSchema = createSPListSchema;
  readonly requiredClients = ["spfi"] as const;

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
  async checkPermissions(
    ctx: M365RuntimeContext<CreateSPListPayload>
  ): Promise<PermissionCheckResult> {
    const scopeIn = ctx.scopeIn;
    const spfi = ctx.clients.spfi;
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

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, CreateSPListPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const spfi = ctx.clients.spfi;
    if (!spfi) {
      return unverifiable({
        reason: "missing_prerequisite",
        message: "SPFI instance not available in scope",
      });
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
        return nonCompliant({ resource: listName, reason: "not_found" });
      }

      const compatibility = checkListStructuralCompatibility(ctx.action.payload.template, found);
      if ("reason" in compatibility && compatibility.reason === "list_template_mismatch") {
        return nonCompliant({
          resource: listName,
          reason: "template_mismatch",
          message: "List exists, but its template does not match the create action payload.",
          details: {
            expectedTemplate: compatibility.expectedTemplate,
            actualTemplate: compatibility.actualTemplate,
          },
        });
      }

      const list = web.lists.getById(found.Id);
      return compliant({
        resource: listName,
        scopeDelta: { web, list },
      });
    } catch (e) {
      return unverifiableError(listName, e);
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
  async handler(
    ctx: M365RuntimeContext<CreateSPListPayload>
  ): Promise<M365ActionResult> {
    const scopeIn = ctx.scopeIn;
    const spfi = ctx.clients.spfi;
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
    const template = ctx.action.payload.template;
    const enableContentTypes = ctx.action.payload.enableContentTypes ?? false;

    // Idempotency: check by RootFolder/Name
    const existing = await getListInfoByRootFolderName(web, listName);
    if (existing?.Id) {
      const compatibility = checkListStructuralCompatibility(template, existing);
      const structuralWarning = buildListStructuralWarning(listName, compatibility);
      if (structuralWarning) {
        ctx.logger.warn("List structural collision detected while skipping create", {
          listName,
          expectedTemplate: template,
          actualTemplate: existing.BaseTemplate,
          warningCode: structuralWarning.code,
        });
      }

      ctx.logger.info("List already exists - skipping creation", {
        webUrl: resolvedWebUrl,
        listName,
        listId: existing.Id,
      });

      return actionSkipped(
        listName,
        "already_exists",
        {
          web,
          list: web.lists.getById(existing.Id),
        },
        structuralWarning ? [structuralWarning] : undefined
      );
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

    return actionExecuted(
      listName,
      {
        web,
        list: web.lists.getById(listId),
      }
    );
  }
}
