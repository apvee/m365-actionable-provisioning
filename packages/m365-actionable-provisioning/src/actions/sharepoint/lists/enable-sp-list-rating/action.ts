/**
 * EnableSPListRating action definition.
 *
 * @remarks
 * Enables rating settings (Likes or Stars) on a SharePoint list.
 *
 * IMPORTANT: this uses the undocumented Microsoft endpoint:
 * `_api/Microsoft.SharePoint.Portal.RatingSettings.SetListRating`
 *
 * Governance:
 * - This action is intended to be used ONLY as a subaction of `createSPList` or `modifySPList`
 *   (because it requires `scopeIn.web` + `scopeIn.list`).
 *
 * The Zod schema for this action is co-located in `schema.ts`.
 *
 * @packageDocumentation
 */
import { ActionDefinition, ComplianceActionCheckResult, ComplianceRuntimeContext } from "../../../../core/action";
import { normalizeError } from "../../../../core";
import type { M365Clients, ProvisioningResultLight, M365Scope, M365RuntimeContext, M365ActionResult } from "../../../../runtime";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/folders";
import "@pnp/sp/folders/list";
import { SPQueryable, spPost } from "@pnp/sp";
import { headers } from "@pnp/queryable";

import { enableSPListRatingSchema, type EnableSPListRatingPayload } from "./schema";


/* ========================================
     ACTION DEFINITION
     ======================================== */

/**
 * Action definition for enabling ratings on SharePoint lists.
 * @public
 */
export class EnableSPListRatingAction extends ActionDefinition<
    "enableSPListRating",
    typeof enableSPListRatingSchema,
    M365Scope,
    ProvisioningResultLight,
    M365Clients
> {
    readonly verb = "enableSPListRating";
    readonly actionSchema = enableSPListRatingSchema;
    readonly requiredClients = ["spfi"] as const;

    private getRatingTypeValue(ratingType: EnableSPListRatingPayload["ratingType"]): 1 | 2 {
        return ratingType === "Stars" ? 1 : 2;
    }

    async handler(ctx: M365RuntimeContext<EnableSPListRatingPayload>): Promise<M365ActionResult> {
        const web = ctx.scopeIn.web;
        const list = ctx.scopeIn.list;

        if (!web || !list) {
            return {
                result: {
                    outcome: "skipped",
                    resource: "(unknown list)",
                    reason: "missing_prerequisite",
                },
            };
        }

        const ratingType = ctx.action.payload.ratingType;
        const ratingTypeValue = this.getRatingTypeValue(ratingType);

        try {
            const listInfo = await list.select("Id", "Title")<{ Id: string; Title: string }>();
            const listIdRaw = listInfo.Id;
            const listIdNormalized = listIdRaw.startsWith("{") ? listIdRaw : `{${listIdRaw}}`;
            const listIdParam = encodeURIComponent(`'${listIdNormalized}'`);

            // Use SPFI pipeline (auth/behaviors) but force an absolute URL target.
            const spfiWeb = ctx.scopeIn?.web;
            const base = spfiWeb ?? web;
            const webInfo = await base.select("Url")();
            const webUrl = webInfo.Url;

            const endpointAbs =
                `${webUrl}/_api/Microsoft.SharePoint.Portal.RatingSettings.SetListRating` +
                `?listID=${listIdParam}&ratingType=${ratingTypeValue}`;

            await spPost(
                SPQueryable([base, endpointAbs]),
                headers({
                    accept: "application/json",
                    "content-type": "application/json;odata=verbose;charset=utf-8",
                    "if-match": "*",
                    "x-http-method": "MERGE",
                })
            );

            ctx.logger.info("List rating settings enabled", {
                listId: listIdNormalized,
                ratingType,
                ratingTypeValue,
                webUrl,
            });

            return {
                result: {
                    outcome: "executed",
                    resource: listInfo.Title,
                },
            };
        } catch (error) {
            throw new Error(
                `Failed to enable rating settings: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    async checkCompliance(
        ctx: ComplianceRuntimeContext<M365Scope, EnableSPListRatingPayload, M365Clients>
    ): Promise<ComplianceActionCheckResult<M365Scope>> {
        const spfi = ctx.clients.spfi;
        if (!spfi) {
            return { outcome: "unverifiable", reason: "missing_prerequisite", message: "SPFI instance not available in scope" };
        }

        const web = ctx.scopeIn.web ?? spfi.web;
        const list = ctx.scopeIn.list;
        if (!list) {
            return { outcome: "unverifiable", resource: "(missing list)", reason: "missing_prerequisite" };
        }

        try {
            const listInfo = await list.select("Title")<{ Title: string }>();
            const resource = listInfo?.Title ?? "(target list)";

            // PnPjs-typed path:
            // list.rootFolder -> folder.properties -> select Ratings_x005f_VotingExperience
            // (no manual URL construction)
            const folderProps = await list.rootFolder.properties
                .select("Ratings_x005f_VotingExperience")<{ Ratings_x005f_VotingExperience?: unknown }>();

            const actualRaw = folderProps.Ratings_x005f_VotingExperience;

            // Presence-only check: consider enabled if the property exists (not null/undefined).
            if (actualRaw === null || actualRaw === undefined) {
                return { outcome: "non_compliant", resource, reason: "disabled", scopeDelta: { web, list } };
            }

            return { outcome: "compliant", resource, scopeDelta: { web, list } };
        } catch (e) {
            return {
                outcome: "unverifiable",
                resource: "(target list)",
                reason: "error",
                message: normalizeError(e).message,
            };
        }
    }
}
