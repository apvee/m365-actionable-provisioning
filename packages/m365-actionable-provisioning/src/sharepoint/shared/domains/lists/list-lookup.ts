/**
 * List lookup utilities for SharePoint provisioning.
 *
 * @remarks
 * Provides functions for finding and resolving SharePoint lists.
 * Extracted from catalogs/actions/lists/base.helpers.ts for reuse.
 *
 * @module provisioning/shared/domains/lists/list-lookup
 * @internal
 */

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import type { IWeb } from "@pnp/sp/webs";

/**
 * Escapes a string for use in OData filter expressions.
 *
 * @remarks
 * OData string literals are single-quoted; embedded quotes must be doubled.
 *
 * @param value - The string to escape
 * @returns The escaped string safe for OData filters
 *
 * @example
 * ```typescript
 * const safe = escapeODataStringLiteral("O'Brien's List");
 * // Returns: "O''Brien''s List"
 * ```
 */
export function escapeODataStringLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * List info shape returned by getListInfoByRootFolderName.
 */
export interface ListInfo {
  Id: string;
  Title?: string;
  RootFolder?: { Name?: string };
}

/**
 * Finds a list by its root folder name (URL name).
 *
 * @remarks
 * Lists can have different Title and RootFolder names. This function
 * locates a list by its URL-friendly root folder name.
 *
 * @param web - The PnPjs IWeb instance to search
 * @param listName - The root folder name to search for
 * @returns The list info if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const listInfo = await getListInfoByRootFolderName(web, "Documents");
 * if (listInfo) {
 *   console.log(`Found list: ${listInfo.Title} (ID: ${listInfo.Id})`);
 * }
 * ```
 */
export async function getListInfoByRootFolderName(
  web: IWeb,
  listName: string
): Promise<ListInfo | undefined> {
  const safe = escapeODataStringLiteral(listName);

  const results = await web.lists
    .expand("RootFolder")
    .select("Id", "Title", "RootFolder/Name")
    .filter(`RootFolder/Name eq '${safe}'`)();

  if (!Array.isArray(results) || results.length === 0) {
    return undefined;
  }

  return results[0] as ListInfo;
}

/**
 * Resolves the target web URL as a string.
 *
 * @remarks
 * `resolveTargetWeb` can return an `effectiveWebUrl` placeholder of `(scope)`
 * when the web is inherited from scope. In those cases we resolve the actual
 * URL by querying the web.
 *
 * @param web - The PnPjs IWeb instance
 * @param effectiveWebUrl - The URL string from resolveTargetWeb
 * @returns The actual web URL string
 *
 * @example
 * ```typescript
 * const { web, effectiveWebUrl } = await resolveTargetWeb({ spfi, scopeWeb, webUrl });
 * const actualUrl = await resolveWebUrlString(web, effectiveWebUrl);
 * ```
 */
export async function resolveWebUrlString(
  web: IWeb,
  effectiveWebUrl: string
): Promise<string> {
  if (effectiveWebUrl !== "(scope)") {
    return effectiveWebUrl;
  }
  const webInfo = await web.select("Url")<{ Url: string }>();
  return webInfo.Url;
}
